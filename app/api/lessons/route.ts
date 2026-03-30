import { getAllLessons, getLessonsByCategory, getLessonCategories, getTotalLessons } from "@/lib/lessons";
import { NextResponse } from "next/server";

export async function GET(req: Request) {
  const url = new URL(req.url);
  const category = url.searchParams.get("category");

  const lessons = category ? getLessonsByCategory(category) : getAllLessons();
  const categories = getLessonCategories();

  return NextResponse.json({
    totalLessons: getTotalLessons(),
    categories,
    lessons,
  }, {
    headers: { "Cache-Control": "s-maxage=3600, stale-while-revalidate=86400" },
  });
}
