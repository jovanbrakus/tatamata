import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { mockExams, mockExamProblems, problems, faculties, problemProgress } from "@/drizzle/schema";
import { eq, and } from "drizzle-orm";
import { NextResponse } from "next/server";

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const userId = (session.user as any).id;
  const { id } = await params;

  // Get exam
  const exam = await db.select().from(mockExams)
    .where(and(eq(mockExams.id, id), eq(mockExams.userId, userId)))
    .limit(1);

  if (exam.length === 0) return NextResponse.json({ error: "Not found" }, { status: 404 });
  if (exam[0].status !== "in_progress") return NextResponse.json({ error: "Ispit je već završen" }, { status: 400 });

  // Get faculty scoring
  const fac = await db.select().from(faculties).where(eq(faculties.id, exam[0].facultyId)).limit(1);
  const scoringCorrect = parseFloat(fac[0].scoringCorrect ?? "1");
  const scoringWrong = parseFloat(fac[0].scoringWrong ?? "0");
  const scoringBlank = parseFloat(fac[0].scoringBlank ?? "0");

  // Get exam problems with correct answers
  const examProblems = await db
    .select({
      epId: mockExamProblems.id,
      answer: mockExamProblems.answer,
      problemId: problems.id,
      correctAnswer: problems.correctAnswer,
    })
    .from(mockExamProblems)
    .innerJoin(problems, eq(mockExamProblems.problemId, problems.id))
    .where(eq(mockExamProblems.examId, id));

  let score = 0;
  let numCorrect = 0;
  let numWrong = 0;
  let numBlank = 0;
  const maxScore = examProblems.length * scoringCorrect;

  for (const ep of examProblems) {
    const isCorrect = ep.answer?.toUpperCase() === ep.correctAnswer.toUpperCase();
    const isBlank = !ep.answer;

    if (isBlank) {
      score += scoringBlank;
      numBlank++;
    } else if (isCorrect) {
      score += scoringCorrect;
      numCorrect++;
    } else {
      score += scoringWrong;
      numWrong++;
    }

    // Mark correct/wrong on exam problem
    await db.update(mockExamProblems).set({ isCorrect: isBlank ? null : isCorrect }).where(eq(mockExamProblems.id, ep.epId));

    // Update problem_progress
    const status = isCorrect ? "solved" : isBlank ? "unseen" : "attempted";
    if (!isBlank) {
      await db.insert(problemProgress).values({
        userId, problemId: ep.problemId, status, attempts: 1, lastAnswer: ep.answer, isCorrect, solvedAt: isCorrect ? new Date() : null, updatedAt: new Date(),
      }).onConflictDoNothing();
    }
  }

  const timeSpent = Math.floor((Date.now() - new Date(exam[0].startedAt!).getTime()) / 1000);
  const scorePercent = maxScore > 0 ? (score / maxScore) * 100 : 0;

  await db.update(mockExams).set({
    status: "completed",
    finishedAt: new Date(),
    timeSpent,
    score: score.toFixed(2),
    maxScore: maxScore.toFixed(2),
    scorePercent: scorePercent.toFixed(2),
    numCorrect,
    numWrong,
    numBlank,
  }).where(eq(mockExams.id, id));

  return NextResponse.json({ examId: id });
}
