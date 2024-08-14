import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  const chainId = request.nextUrl.searchParams.get("chainId");
  const worldAddress = request.nextUrl.searchParams.get("worldAddress");
  const requestHeaders = new Headers(request.headers);

  if (chainId) {
    requestHeaders.set("x-chain-id", chainId);
  }

  if (worldAddress) {
    requestHeaders.set("x-world-address", worldAddress as string);
  }

  return NextResponse.next({
    request: {
      headers: requestHeaders,
    },
  });
}

export const config = {
  matcher: "/:path*",
};
