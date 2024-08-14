import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  const worldAddress = request.nextUrl.searchParams.get("worldAddress") || process.env.NEXT_PUBLIC_WORLD_ADDRESS;
  const requestHeaders = new Headers(request.headers);
  requestHeaders.set("x-world-address", worldAddress as string);

  return NextResponse.next({
    request: {
      headers: requestHeaders,
    },
  });
}

export const config = {
  matcher: "/:path*",
};
