import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { leaderboardScores } from "@/drizzle/schema";
import { eq, sql, gt } from "drizzle-orm";
import { NextResponse } from "next/server";

export async function GET() {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const userId = session.user.id;

  const myScore = await db.select().from(leaderboardScores).where(eq(leaderboardScores.userId, userId)).limit(1);

  if (myScore.length === 0) {
    return NextResponse.json({ rank: null, score: null });
  }

  const rank = await db
    .select({ count: sql<number>`count(*) + 1` })
    .from(leaderboardScores)
    .where(gt(leaderboardScores.totalScore, myScore[0].totalScore));

  return NextResponse.json({
    rank: Number(rank[0]?.count ?? 1),
    ...myScore[0],
  });
}
