import { NextResponse } from "next/server";
import { getRunningTasks } from "@/src/lib/system";

let cachedTasks: any = null;
let cacheTime = 0;
const CACHE_DURATION = 2000; // 2 second cache (tasks refresh slower)

export async function GET() {
  try {
    const now = Date.now();
    
    // Return cached data if still fresh
    if (cachedTasks && now - cacheTime < CACHE_DURATION) {
      return NextResponse.json(cachedTasks, {
        status: 200,
        headers: {
          "Cache-Control": "public, max-age=2, stale-while-revalidate=3",
          "X-Cache": "HIT",
        },
      });
    }
    
    const tasks = await getRunningTasks();
    cachedTasks = tasks;
    cacheTime = now;
    
    return NextResponse.json(tasks, {
      status: 200,
      headers: {
        "Cache-Control": "public, max-age=2, stale-while-revalidate=3",
        "X-Cache": "MISS",
      },
    });
  } catch (error) {
    return NextResponse.json(
      {
        error: "Unable to fetch running tasks",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
