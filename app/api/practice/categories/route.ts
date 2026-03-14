import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { problemProgress } from "@/drizzle/schema";
import { eq } from "drizzle-orm";
import { NextResponse } from "next/server";
import { getCategoryGroups, getAllMeta, getCategories } from "@/lib/problems";

export async function GET() {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const userId = (session.user as any).id;

  // Get user's progress from DB
  const progressRows = await db
    .select({
      problemId: problemProgress.problemId,
      isCorrect: problemProgress.isCorrect,
      status: problemProgress.status,
    })
    .from(problemProgress)
    .where(eq(problemProgress.userId, userId));

  const solvedIds = new Set(progressRows.filter((r) => r.isCorrect).map((r) => r.problemId));
  const attemptedIds = new Set(progressRows.filter((r) => r.status !== "unseen").map((r) => r.problemId));

  // Count problems per category from filesystem index
  const allProblems = getAllMeta();
  const categoryGroups = getCategoryGroups();
  const categoriesData = getCategories();
  const categoryNameMap = new Map(categoriesData.map((c) => [c.id, c.sr]));

  // Build per-category stats
  const categoryStats: Record<string, { total: number; solved: number; attempted: number }> = {};
  for (const p of allProblems) {
    if (!p.category) continue;
    if (!categoryStats[p.category]) categoryStats[p.category] = { total: 0, solved: 0, attempted: 0 };
    categoryStats[p.category].total++;
    if (solvedIds.has(p.id)) categoryStats[p.category].solved++;
    if (attemptedIds.has(p.id)) categoryStats[p.category].attempted++;
  }

  // Aggregate into category groups
  const categories = categoryGroups.map((group) => {
    let totalProblems = 0;
    let solvedCorrectly = 0;
    let attempted = 0;

    for (const catId of group.categories) {
      const stats = categoryStats[catId];
      if (stats) {
        totalProblems += stats.total;
        solvedCorrectly += stats.solved;
        attempted += stats.attempted;
      }
    }

    const progressPercent = totalProblems > 0
      ? Math.round((solvedCorrectly / totalProblems) * 100)
      : 0;

    return {
      id: group.id,
      name: group.sr,
      icon: group.id,
      topicIds: group.categories,
      totalProblems,
      solvedCorrectly,
      attempted,
      progressPercent,
    };
  });

  return NextResponse.json({ categories });
}
