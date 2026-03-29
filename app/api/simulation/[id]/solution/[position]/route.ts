import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { mockExams, mockExamProblems } from "@/drizzle/schema";
import { eq, and } from "drizzle-orm";
import { NextResponse } from "next/server";
import { getProblemFull } from "@/lib/problems";

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string; position: string }> }
) {
  const session = await auth();
  if (!session?.user)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const userId = (session.user as any).id;
  const { id, position: posStr } = await params;
  const position = parseInt(posStr, 10);

  if (isNaN(position) || position < 1)
    return NextResponse.json({ error: "Invalid position" }, { status: 400 });

  // Verify exam exists and belongs to user
  const exam = await db
    .select({ id: mockExams.id, status: mockExams.status })
    .from(mockExams)
    .where(and(eq(mockExams.id, id), eq(mockExams.userId, userId)))
    .limit(1);

  if (exam.length === 0)
    return NextResponse.json({ error: "Not found" }, { status: 404 });

  // Find the problem at this position
  const row = await db
    .select({
      problemId: mockExamProblems.problemId,
      answer: mockExamProblems.answer,
      isCorrect: mockExamProblems.isCorrect,
      pointValue: mockExamProblems.pointValue,
    })
    .from(mockExamProblems)
    .where(
      and(
        eq(mockExamProblems.examId, id),
        eq(mockExamProblems.position, position)
      )
    )
    .limit(1);

  if (row.length === 0)
    return NextResponse.json({ error: "Problem not found at this position" }, { status: 404 });

  const problem = getProblemFull(row[0].problemId);

  return NextResponse.json({
    position,
    problemId: row[0].problemId,
    title: problem?.title ?? `Zadatak ${position}`,
    correctAnswer: problem?.correctAnswer ?? "A",
    answerOptions: problem?.answerOptions ?? [],
    numOptions: problem?.numOptions ?? 5,
    difficulty: problem?.difficulty ?? null,
    category: problem?.category ?? null,
    userAnswer: row[0].answer,
    isCorrect: row[0].isCorrect,
    pointValue: row[0].pointValue,
  });
}
