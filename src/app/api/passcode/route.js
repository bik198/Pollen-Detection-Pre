import { NextResponse } from "next/server";

const PASSCODE = "4565";
const COOKIE_NAME = "pollen_auth";
const COOKIE_VALUE = "granted-4565";

export async function POST(request) {
  let body;
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  if (body?.code !== PASSCODE) {
    return Response.json({ error: "Incorrect passcode" }, { status: 401 });
  }

  const username = typeof body?.username === "string" ? body.username.trim().slice(0, 40) : "";
  if (!username) {
    return Response.json({ error: "Username is required" }, { status: 400 });
  }

  const response = NextResponse.json({ ok: true });
  response.cookies.set(COOKIE_NAME, COOKIE_VALUE, {
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
