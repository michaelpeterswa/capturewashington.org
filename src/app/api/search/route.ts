import { NextRequest, NextResponse } from "next/server";
import { searchEntries } from "@/lib/search";

export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl;

  const q = searchParams.get("q") || undefined;
  const tagsParam = searchParams.get("tags");
  const tags = tagsParam ? tagsParam.split(",") : undefined;
  const dateFrom = searchParams.get("dateFrom") || undefined;
  const dateTo = searchParams.get("dateTo") || undefined;
  const latStr = searchParams.get("lat");
  const lngStr = searchParams.get("lng");
  const radiusStr = searchParams.get("radius");
  const cursor = searchParams.get("cursor") || undefined;
  const limitStr = searchParams.get("limit");

  const lat = latStr ? parseFloat(latStr) : undefined;
  const lng = lngStr ? parseFloat(lngStr) : undefined;
  const radius = radiusStr ? parseFloat(radiusStr) : undefined;

  if (radius !== undefined && (lat === undefined || lng === undefined)) {
    return NextResponse.json(
      { error: "radius requires lat and lng" },
      { status: 400 },
    );
  }

  const results = await searchEntries({
    q,
    tags,
    dateFrom,
    dateTo,
    lat,
    lng,
    radius,
    cursor,
    limit: limitStr ? parseInt(limitStr) : undefined,
  });

  return NextResponse.json(results);
}
