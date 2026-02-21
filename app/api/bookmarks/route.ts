import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { bookmarks, problems } from "@/drizzle/schema";
import { eq, desc } from "drizzle-orm";
import { NextResponse } from "next/server";

export async function GET() {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const userId = (session.user as any).id;

  const result = await db
    .select({
      problemId: bookmarks.problemId,
      createdAt: bookmarks.createdAt,
      slug: problems.slug,
      title: problems.title,
      facultyId: problems.facultyId,
      year: problems.year,
      problemNumber: problems.problemNumber,
    })
    .from(bookmarks)
    .innerJoin(problems, eq(bookmarks.problemId, problems.id))
    .where(eq(bookmarks.userId, userId))
    .orderBy(desc(bookmarks.createdAt));

  return NextResponse.json(result);
}
