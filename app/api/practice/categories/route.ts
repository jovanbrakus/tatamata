import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { problemProgress } from "@/drizzle/schema";
import { eq } from "drizzle-orm";
import { NextResponse } from "next/server";
import { getCategoryGroupsWithCounts } from "@/lib/problems";

export async function GET() {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const userId = (session.user as any).id;

  // Get user's solved problem IDs from DB
  const progressRows = await db
    .select({ problemId: problemProgress.problemId, isCorrect: problemProgress.isCorrect })
    .from(problemProgress)
    .where(eq(problemProgress.userId, userId));

  const solvedIds = new Set(progressRows.filter((r) => r.isCorrect).map((r) => r.problemId));

  // Use existing utility that returns per-subcategory breakdown
  const groupsWithCounts = getCategoryGroupsWithCounts(solvedIds);

  const categories = groupsWithCounts.map((group) => ({
    id: group.id,
    name: group.name,
    totalProblems: group.total,
    solvedCorrectly: group.solved,
    progressPercent: group.total > 0 ? Math.round((group.solved / group.total) * 100) : 0,
    categories: group.categories,
  }));

  return NextResponse.json({ categories });
}
