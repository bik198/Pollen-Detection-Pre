import { NextResponse } from "next/server";

const COOKIE_NAME = "pollen_auth";

export function middleware(request) {
  const secret = process.env.POLLEN_AUTH_COOKIE_SECRET;
  const cookie = request.cookies.get(COOKIE_NAME);
  if (secret && cookie?.value === secret) {
    return NextResponse.next();
  }

  const passcodeUrl = new URL("/passcode", request.url);
  passcodeUrl.searchParams.set("from", request.nextUrl.pathname);
  return NextResponse.redirect(passcodeUrl);
}

export const config = {
  matcher: ["/((?!api/passcode|passcode|_next/static|_next/image|favicon.ico).*)"],
};
