import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { mockExams, mockExamProblems, faculties } from "@/drizzle/schema";
import { eq, and, asc } from "drizzle-orm";
import { NextResponse } from "next/server";
import { getProblemFull } from "@/lib/problems";

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const userId = session.user.id;
  const { id } = await params;

  const exam = await db
    .select()
    .from(mockExams)
    .where(and(eq(mockExams.id, id), eq(mockExams.userId, userId)))
    .limit(1);

  if (exam.length === 0)
    return NextResponse.json({ error: "Not found" }, { status: 404 });

  const faculty = await db
    .select()
    .from(faculties)
    .where(eq(faculties.id, exam[0].facultyId))
    .limit(1);

  // Get exam problem rows (no join with problems table)
  const examProblemRows = await db
    .select({
      position: mockExamProblems.position,
      pointValue: mockExamProblems.pointValue,
      answer: mockExamProblems.answer,
      isCorrect: mockExamProblems.isCorrect,
      isFlagged: mockExamProblems.isFlagged,
      problemId: mockExamProblems.problemId,
    })
    .from(mockExamProblems)
    .where(eq(mockExamProblems.examId, id))
    .orderBy(asc(mockExamProblems.position));

  // Enrich each problem with data from the filesystem
  const examProblems = examProblemRows.map((row) => {
    const problem = getProblemFull(row.problemId);
    return {
      position: row.position,
      pointValue: row.pointValue,
      answer: row.answer,
      isCorrect: row.isCorrect,
      isFlagged: row.isFlagged,
      title: problem?.title ?? `Zadatak ${row.position}`,
      correctAnswer: problem?.correctAnswer ?? "A",
    };
  });

  return NextResponse.json({
    exam: exam[0],
    faculty: faculty[0],
    problems: examProblems,
  });
}
