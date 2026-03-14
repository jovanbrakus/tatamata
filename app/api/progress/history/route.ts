import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { problemProgress } from "@/drizzle/schema";
import { eq, desc } from "drizzle-orm";
import { NextResponse } from "next/server";
import { getProblemMeta } from "@/lib/problems";

export async function GET(req: Request) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const userId = (session.user as any).id;
  const url = new URL(req.url);
  const limit = Math.min(Number(url.searchParams.get("limit") || "20"), 50);

  const rows = await db
    .select({
      problemId: problemProgress.problemId,
      status: problemProgress.status,
      isCorrect: problemProgress.isCorrect,
      updatedAt: problemProgress.updatedAt,
    })
    .from(problemProgress)
    .where(eq(problemProgress.userId, userId))
    .orderBy(desc(problemProgress.updatedAt))
    .limit(limit);

  const result = rows
    .map((row) => {
      const meta = getProblemMeta(row.problemId);
      return {
        id: row.problemId,
        title: meta ? `${meta.facultyId} ${meta.year} #${meta.problemNumber}` : row.problemId,
        facultyId: meta?.facultyId ?? null,
        year: meta?.year ?? null,
        problemNumber: meta?.problemNumber ?? null,
        status: row.status,
        isCorrect: row.isCorrect,
        updatedAt: row.updatedAt,
      };
    });

  return NextResponse.json(result);
}
