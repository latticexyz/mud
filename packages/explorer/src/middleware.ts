import { NextRequest, NextResponse } from "next/server";

const corsOptions = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
};

export function middleware(request: NextRequest) {
  const isPreflight = request.method === "OPTIONS";
  if (isPreflight) {
    return NextResponse.json({}, { headers: corsOptions });
  }

  const response = NextResponse.next();
  Object.entries(corsOptions).forEach(([key, value]) => {
    response.headers.set(key, value);
  });

  return response;
}

export const config = {
  matcher: "/api/:path*",
};
