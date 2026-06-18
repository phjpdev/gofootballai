import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";

const SERVER_API_URL =
  process.env.API_URL ??
  process.env.NEXT_PUBLIC_API_URL ??
  "http://127.0.0.1:4000";

export async function GET(request: NextRequest) {
  try {
    const refresh = request.nextUrl.searchParams.get("refresh");
    const query = refresh === "1" ? "?refresh=1" : "";
    const response = await fetch(`${SERVER_API_URL}/api/hkjc/matches${query}`, {
      cache: "no-store",
    });
    const body = await response.text();
    return new NextResponse(body, {
      status: response.status,
      headers: {
        "Content-Type": "application/json",
        "Cache-Control": "no-store",
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
