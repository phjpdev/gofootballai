import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  const type = request.nextUrl.searchParams.get("type");
  const id = request.nextUrl.searchParams.get("id");

  if (!id || (type !== "team" && type !== "tournament")) {
    return NextResponse.json({ error: "參數無效" }, { status: 400 });
  }

  const url = `https://consvc.hkjc.com/football/info/logo/${type}/${id}.png`;

  try {
    const response = await fetch(url, {
      headers: {
        Referer: "https://bet.hkjc.com/",
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
      },
      next: { revalidate: 86400 },
    });

    if (!response.ok) {
      return NextResponse.json({ error: "找不到球隊標誌" }, { status: 404 });
    }

    const buffer = await response.arrayBuffer();
    return new NextResponse(buffer, {
      headers: {
        "Content-Type": response.headers.get("Content-Type") ?? "image/png",
        "Cache-Control": "public, max-age=86400, stale-while-revalidate=604800",
      },
    });
  } catch {
    return NextResponse.json({ error: "無法取得球隊標誌" }, { status: 502 });
  }
}
