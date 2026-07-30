import { NextResponse } from "next/server";

const COOKIE_NAME = "pollen_auth";

export async function POST(request) {
  let body;
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const passcode = process.env.POLLEN_PASSCODE;
  if (!passcode || body?.code !== passcode) {
    return Response.json({ error: "Incorrect passcode" }, { status: 401 });
  }

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
