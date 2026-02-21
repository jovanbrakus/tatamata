import { db } from "@/lib/db";
import { leaderboardScores } from "@/drizzle/schema";
import { desc } from "drizzle-orm";
import { NextResponse } from "next/server";

export async function GET(req: Request) {
  const url = new URL(req.url);
  const limit = parseInt(url.searchParams.get("limit") || "50");

  const result = await db
    .select()
    .from(leaderboardScores)
    .orderBy(desc(leaderboardScores.totalScore))
    .limit(limit);

  return NextResponse.json(result);
}
