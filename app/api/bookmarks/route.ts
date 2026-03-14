import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { bookmarks } from "@/drizzle/schema";
import { eq, desc } from "drizzle-orm";
import { NextResponse } from "next/server";
import { getProblemMeta } from "@/lib/problems";

export async function GET() {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const userId = (session.user as any).id;

  const rows = await db
    .select({
      problemId: bookmarks.problemId,
      createdAt: bookmarks.createdAt,
    })
    .from(bookmarks)
    .where(eq(bookmarks.userId, userId))
    .orderBy(desc(bookmarks.createdAt));

  const result = rows
    .map((row) => {
      const meta = getProblemMeta(row.problemId);
      if (!meta) return null;
      return {
        id: meta.id,
        title: `${meta.facultyId} ${meta.year} #${meta.problemNumber}`,
        facultyId: meta.facultyId,
        year: meta.year,
        problemNumber: meta.problemNumber,
        createdAt: row.createdAt,
      };
    })
    .filter(Boolean);

  return NextResponse.json(result);
}
