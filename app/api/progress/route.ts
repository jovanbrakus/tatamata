import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { problemProgress, problems } from "@/drizzle/schema";
import { eq, sql, and } from "drizzle-orm";
import { NextResponse } from "next/server";

export async function GET() {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const userId = (session.user as any).id;

  const [totalResult, progressResult] = await Promise.all([
    db.select({ count: sql<number>`count(*)` }).from(problems).where(eq(problems.isPublished, true)),
    db
      .select({
        status: problemProgress.status,
        count: sql<number>`count(*)`,
      })
      .from(problemProgress)
      .where(eq(problemProgress.userId, userId))
      .groupBy(problemProgress.status),
  ]);

  const total = Number(totalResult[0]?.count ?? 0);
  const byStatus: Record<string, number> = {};
  for (const row of progressResult) {
    byStatus[row.status] = Number(row.count);
  }

  return NextResponse.json({
    total,
    solved: byStatus.solved ?? 0,
    attempted: byStatus.attempted ?? 0,
    unseen: total - (byStatus.solved ?? 0) - (byStatus.attempted ?? 0),
  });
}
