import { db } from "@/lib/db";
import { problems } from "@/drizzle/schema";
import { eq } from "drizzle-orm";
import { NextResponse } from "next/server";

export async function GET(req: Request, { params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;

  const result = await db
    .select({ htmlContent: problems.htmlContent })
    .from(problems)
    .where(eq(problems.slug, slug))
    .limit(1);

  if (result.length === 0) {
    return new NextResponse("Not found", { status: 404 });
  }

  return new NextResponse(result[0].htmlContent, {
    headers: {
      "Content-Type": "text/html; charset=utf-8",
      "Content-Security-Policy": "default-src 'self' 'unsafe-inline' 'unsafe-eval' https://cdn.jsdelivr.net https://fonts.googleapis.com https://fonts.gstatic.com; img-src 'self' data:; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com;",
      "X-Frame-Options": "SAMEORIGIN",
    },
  });
}
