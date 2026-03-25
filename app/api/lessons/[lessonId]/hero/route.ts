import { getLessonHeroPath } from "@/lib/lessons";
import { NextResponse } from "next/server";
import fs from "fs";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ lessonId: string }> }
) {
  const { lessonId } = await params;
  const heroPath = getLessonHeroPath(lessonId);

  if (!heroPath) {
    return new NextResponse(null, { status: 404 });
  }

  const buffer = fs.readFileSync(heroPath);
  return new NextResponse(buffer, {
    headers: {
      "Content-Type": "image/png",
      "Cache-Control": "public, max-age=31536000, immutable",
    },
  });
}
