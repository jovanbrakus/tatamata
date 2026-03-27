import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { userAnalytics, mockExams, faculties } from "@/drizzle/schema";
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

  const userId = (session.user as any).id;

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
          readinessScore: Number(analytics.readinessScore),
          readinessBreakdown: analytics.readinessBreakdown,
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
