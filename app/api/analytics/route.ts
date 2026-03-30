import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { userAnalytics, mockExams, faculties, users } from "@/drizzle/schema";
import { eq, desc, and } from "drizzle-orm";
import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";

function getAllCategories(): { id: string; name: string }[] {
  const filePath = path.join(process.cwd(), "database", "categories.json");
  const data = JSON.parse(fs.readFileSync(filePath, "utf-8"));
  return data.map((c: any) => ({ id: c.id, name: c.sr || c.en }));
}

function getCategoryGroups(): { id: string; name: string; categories: string[] }[] {
  const filePath = path.join(process.cwd(), "database", "category_groups.json");
  const data = JSON.parse(fs.readFileSync(filePath, "utf-8"));
  return data.map((g: any) => ({ id: g.id, name: g.sr || g.en, categories: g.categories }));
}

function fillCategoryBreakdown(
  breakdown: Record<string, any> | null | undefined,
  allCategories: { id: string; name: string }[]
): Record<string, any> {
  const filled: Record<string, any> = {};
  for (const cat of allCategories) {
    if (breakdown && breakdown[cat.id]) {
      filled[cat.id] = breakdown[cat.id];
    } else {
      filled[cat.id] = { name: cat.name, correct: 0, total: 0, percent: 0 };
    }
  }
  return filled;
}

export async function GET() {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const userId = session.user.id;

  // Fetch analytics data
  const analyticsRows = await db
    .select()
    .from(userAnalytics)
    .where(eq(userAnalytics.userId, userId))
    .limit(1);

  const analytics = analyticsRows[0] ?? null;

  // Fetch recent completed simulations (last 5)
  const recentExams = await db
    .select({
      id: mockExams.id,
      facultyId: mockExams.facultyId,
      facultyName: faculties.shortName,
      scorePercent: mockExams.scorePercent,
      timeSpent: mockExams.timeSpent,
      numCorrect: mockExams.numCorrect,
      numWrong: mockExams.numWrong,
      numBlank: mockExams.numBlank,
      finishedAt: mockExams.finishedAt,
      mode: mockExams.mode,
    })
    .from(mockExams)
    .innerJoin(faculties, eq(mockExams.facultyId, faculties.id))
    .where(and(eq(mockExams.userId, userId), eq(mockExams.status, "completed")))
    .orderBy(desc(mockExams.finishedAt))
    .limit(5);

  const allCategories = getAllCategories();
  const categoryGroups = getCategoryGroups();

  // Recompute inactivity penalty at read time so it's always fresh
  let readinessScore = analytics ? Number(analytics.readinessScore) : 0;
  let readinessBreakdown = analytics?.readinessBreakdown as any;
  if (analytics && readinessBreakdown?.rawScore != null) {
    const userRow = await db
      .select({ lastActiveDate: users.lastActiveDate })
      .from(users)
      .where(eq(users.id, userId))
      .limit(1);

    let freshPenalty = 0;
    let daysInactive = 0;
    if (userRow.length > 0 && userRow[0].lastActiveDate) {
      const lastActive = new Date(userRow[0].lastActiveDate);
      const today = new Date();
      const todayDate = new Date(today.getFullYear(), today.getMonth(), today.getDate());
      const lastDate = new Date(lastActive.getFullYear(), lastActive.getMonth(), lastActive.getDate());
      daysInactive = Math.floor((todayDate.getTime() - lastDate.getTime()) / (1000 * 60 * 60 * 24));
      freshPenalty = Math.min(20, Math.max(0, (daysInactive - 2) * 2));
    }

    readinessScore = Math.max(0, Math.round(readinessBreakdown.rawScore - freshPenalty));
    readinessBreakdown = {
      ...readinessBreakdown,
      finalScore: readinessScore,
      inactivityPenalty: freshPenalty,
      daysInactive,
    };
  }

  return NextResponse.json({
    analytics: analytics
      ? {
          accuracyPercent: Number(analytics.accuracyPercent),
          avgSolveTimeSec: analytics.avgSolveTimeSec,
          percentileRank: Number(analytics.percentileRank),
          totalSimulations: analytics.totalSimulations,
          problemsSolved: analytics.problemsSolved,
          problemsAttempted: analytics.problemsAttempted,
          categoryBreakdown: fillCategoryBreakdown(analytics.categoryBreakdown as Record<string, any>, allCategories),
          strengths: analytics.strengths,
          weaknesses: analytics.weaknesses,
          trendData: analytics.trendData,
          readinessScore,
          readinessBreakdown,
          updatedAt: analytics.updatedAt,
        }
      : null,
    categoryGroups,
    recentExams: recentExams.map((e) => ({
      id: e.id,
      facultyId: e.facultyId,
      facultyName: e.facultyName,
      scorePercent: Number(e.scorePercent),
      timeSpent: e.timeSpent,
      numCorrect: e.numCorrect,
      numWrong: e.numWrong,
      numBlank: e.numBlank,
      finishedAt: e.finishedAt,
      mode: e.mode,
    })),
  });
}
