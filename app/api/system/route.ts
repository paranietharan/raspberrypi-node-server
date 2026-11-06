import { NextResponse } from "next/server";
import { getSystemDetails } from "@/src/lib/system";

let cachedMetrics: Awaited<ReturnType<typeof getSystemDetails>> | null = null;
let cacheTime = 0;
const CACHE_DURATION = 1000; // 1 second cache

export async function GET() {
  try {
    const now = Date.now();
    
    // Return cached data if still fresh
    if (cachedMetrics && now - cacheTime < CACHE_DURATION) {
      return NextResponse.json(cachedMetrics, {
        status: 200,
        headers: {
          "Cache-Control": "private, no-store",
          "X-Cache": "HIT",
        },
      });
    }
    
    const details = await getSystemDetails();
    cachedMetrics = details;
    cacheTime = now;
    
    return NextResponse.json(details, {
      status: 200,
      headers: {
        "Cache-Control": "private, no-store",
        "X-Cache": "MISS",
      },
    });
  } catch (error) {
    return NextResponse.json(
      {
        error: "Unable to fetch system metrics",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}