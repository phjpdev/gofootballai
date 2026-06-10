import { NextResponse } from "next/server";
import { fetchHkjcMatches } from "@/lib/hkjc/fetch-matches";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const data = await fetchHkjcMatches();
    return NextResponse.json(data, {
      headers: {
        "Cache-Control": "public, s-maxage=60, stale-while-revalidate=120",
      },
    });
  } catch (error) {
    console.error("HKJC matches fetch failed:", error);
    return NextResponse.json(
      { error: "無法取得馬會賽事資料" },
      { status: 502 },
    );
  }
}
