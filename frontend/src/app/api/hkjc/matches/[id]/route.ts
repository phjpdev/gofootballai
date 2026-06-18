import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";

const SERVER_API_URL =
  process.env.API_URL ??
  process.env.NEXT_PUBLIC_API_URL ??
  "http://127.0.0.1:4000";

type RouteContext = {
  params: Promise<{ id: string }>;
};

export async function GET(_request: NextRequest, context: RouteContext) {
  const { id } = await context.params;

  try {
    const response = await fetch(
      `${SERVER_API_URL}/api/hkjc/matches/${encodeURIComponent(id)}`,
      { cache: "no-store" },
    );
    const body = await response.text();
    return new NextResponse(body, {
      status: response.status,
      headers: {
        "Content-Type": "application/json",
        "Cache-Control": "public, s-maxage=60, stale-while-revalidate=120",
      },
    });
  } catch (error) {
    console.error("HKJC match proxy failed:", error);
    return NextResponse.json(
      { error: "無法取得馬會賽事資料" },
      { status: 502 },
    );
  }
}
