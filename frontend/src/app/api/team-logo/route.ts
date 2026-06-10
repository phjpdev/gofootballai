import { NextRequest, NextResponse } from "next/server";
import { resolveTeamLogoUrl } from "@/lib/team-logos/resolve";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  const name = request.nextUrl.searchParams.get("name")?.trim();

  if (!name) {
    return NextResponse.json({ error: "缺少球隊名稱" }, { status: 400 });
  }

  const url = await resolveTeamLogoUrl(name);

  if (!url) {
    return NextResponse.json({ url: null }, { status: 404 });
  }

  return NextResponse.json(
    { url },
    {
      headers: {
        "Cache-Control": "public, max-age=86400, stale-while-revalidate=604800",
      },
    },
  );
}
