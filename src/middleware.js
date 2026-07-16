import { NextResponse } from "next/server";

const COOKIE_NAME = "pollen_auth";
const COOKIE_VALUE = "granted-4565";

export function middleware(request) {
  const cookie = request.cookies.get(COOKIE_NAME);
  if (cookie?.value === COOKIE_VALUE) {
    return NextResponse.next();
  }

  const passcodeUrl = new URL("/passcode", request.url);
  passcodeUrl.searchParams.set("from", request.nextUrl.pathname);
  return NextResponse.redirect(passcodeUrl);
}

export const config = {
  matcher: ["/((?!api/passcode|passcode|_next/static|_next/image|favicon.ico).*)"],
};
