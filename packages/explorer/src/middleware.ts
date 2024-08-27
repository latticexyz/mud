import { NextRequest, NextResponse } from "next/server";

export function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname;
  const worldAddress = process.env.WORLD_ADDRESS;

  if ((pathname === "/" || pathname === "/worlds") && worldAddress) {
    return NextResponse.redirect(new URL(`/worlds/${worldAddress}/explorer`, request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: "/((?!api|_next/static|_next/image|favicon.ico).*)",
};
