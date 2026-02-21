import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { mockExams, faculties } from "@/drizzle/schema";
import { eq, desc } from "drizzle-orm";
import { NextResponse } from "next/server";

export async function GET() {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const userId = (session.user as any).id;

  const result = await db
    .select({
      id: mockExams.id,
      facultyId: mockExams.facultyId,
      facultyName: faculties.shortName,
      status: mockExams.status,
      score: mockExams.score,
      maxScore: mockExams.maxScore,
      scorePercent: mockExams.scorePercent,
      numCorrect: mockExams.numCorrect,
      numWrong: mockExams.numWrong,
      numBlank: mockExams.numBlank,
      timeSpent: mockExams.timeSpent,
      startedAt: mockExams.startedAt,
    })
    .from(mockExams)
    .innerJoin(faculties, eq(mockExams.facultyId, faculties.id))
    .where(eq(mockExams.userId, userId))
    .orderBy(desc(mockExams.startedAt));

  return NextResponse.json(result);
}
