import { NextResponse } from "next/server";

const COOKIE_NAME = "pollen_auth";

// In-memory only — resets on redeploy/cold start and is per-instance under
// horizontal scaling, but this app has no Redis/KV set up, and any throttle
// is a meaningful deterrent against scripting all 10,000 4-digit codes.
const WINDOW_MS = 10 * 60 * 1000;
const MAX_ATTEMPTS = 5;
const LOCKOUT_MS = 5 * 60 * 1000;
const attempts = new Map();

function getClientIp(request) {
  const forwarded = request.headers.get("x-forwarded-for");
  if (forwarded) return forwarded.split(",")[0].trim();
  return "unknown";
}

function checkRateLimit(ip) {
  const now = Date.now();
  const entry = attempts.get(ip);
  if (!entry) return { limited: false };
  if (entry.lockedUntil) {
    if (entry.lockedUntil > now) return { limited: true, retryAfterMs: entry.lockedUntil - now };
    attempts.delete(ip);
    return { limited: false };
  }
  if (now - entry.windowStart > WINDOW_MS) {
    attempts.delete(ip);
    return { limited: false };
  }
  return { limited: false };
}

function recordFailure(ip) {
  const now = Date.now();
  const entry = attempts.get(ip);
  if (!entry || now - entry.windowStart > WINDOW_MS) {
    attempts.set(ip, { count: 1, windowStart: now, lockedUntil: null });
    return;
  }
  entry.count += 1;
  if (entry.count >= MAX_ATTEMPTS) {
    entry.lockedUntil = now + LOCKOUT_MS;
  }
}

export async function POST(request) {
  const ip = getClientIp(request);
  const rateLimit = checkRateLimit(ip);
  if (rateLimit.limited) {
    return Response.json(
      { error: "Too many attempts. Try again later." },
      { status: 429, headers: { "Retry-After": String(Math.ceil(rateLimit.retryAfterMs / 1000)) } },
    );
  }

  let body;
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const passcode = process.env.POLLEN_PASSCODE;
  if (!passcode || body?.code !== passcode) {
    recordFailure(ip);
    return Response.json({ error: "Incorrect passcode" }, { status: 401 });
  }

  attempts.delete(ip);

  const cookieValue = process.env.POLLEN_AUTH_COOKIE_SECRET;
  if (!cookieValue) {
    return Response.json({ error: "Server misconfigured: POLLEN_AUTH_COOKIE_SECRET not set" }, { status: 500 });
  }

  const username = typeof body?.username === "string" ? body.username.trim().slice(0, 40) : "";
  if (!username) {
    return Response.json({ error: "Username is required" }, { status: 400 });
  }

  const response = NextResponse.json({ ok: true });
  response.cookies.set(COOKIE_NAME, cookieValue, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 30,
  });
  response.cookies.set("pollen_user", username, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 30,
  });
  return response;
}
