import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { aiSolutions } from "@/drizzle/schema";
import { eq, and } from "drizzle-orm";
import { NextResponse } from "next/server";

export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const userId = session.user.id;
  const { id } = await params;

  const result = await db.select({ htmlContent: aiSolutions.htmlContent }).from(aiSolutions)
    .where(and(eq(aiSolutions.id, id), eq(aiSolutions.userId, userId)))
    .limit(1);

  if (result.length === 0) return new NextResponse("Not found", { status: 404 });

  return new NextResponse(result[0].htmlContent, {
    headers: {
      "Content-Type": "text/html; charset=utf-8",
      "X-Frame-Options": "SAMEORIGIN",
    },
  });
}
