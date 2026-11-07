import { NextResponse, type NextRequest } from "next/server";
import { isAuthorized } from "./src/lib/auth";

export function proxy(request: NextRequest) {
  if (!isAuthorized(request.headers.get("authorization"), process.env.MONITOR_USERNAME, process.env.MONITOR_PASSWORD)) {
    return new NextResponse("Authentication required", {
      status: 401,
      headers: { "WWW-Authenticate": 'Basic realm="Raspberry Pi Monitor", charset="UTF-8"', "Cache-Control": "private, no-store" },
    });
  }
  return NextResponse.next();
}

export const config = { matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"] };
