import { NextResponse } from "next/server";
import { getHkjcApiUrl } from "@/lib/hkjc/matches-api";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const response = await fetch(getHkjcApiUrl("/matches"), { cache: "no-store" });
    const body = await response.text();
    return new NextResponse(body, {
      status: response.status,
      headers: {
        "Content-Type": "application/json",
        "Cache-Control": "public, s-maxage=60, stale-while-revalidate=120",
      },
    });
  } catch (error) {
    console.error("HKJC matches proxy failed:", error);
    return NextResponse.json(
      { error: "無法取得馬會賽事資料" },
      { status: 502 },
    );
  }
}
