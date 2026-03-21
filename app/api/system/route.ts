import { NextResponse } from "next/server";
import { getSystemDetails } from "@/src/lib/system";

export async function GET() {
  try {
    const details = await getSystemDetails();
    return NextResponse.json(details, { status: 200 });
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