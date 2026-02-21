import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { mockExams, mockExamProblems, problems, faculties } from "@/drizzle/schema";
import { eq, and, sql } from "drizzle-orm";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const userId = (session.user as any).id;
  const { facultyId } = await req.json();

  // Get faculty config
  const fac = await db.select().from(faculties).where(eq(faculties.id, facultyId)).limit(1);
  if (fac.length === 0) return NextResponse.json({ error: "Fakultet nije pronađen" }, { status: 404 });

  const faculty = fac[0];
  const numProblems = faculty.examNumProblems;
  const durationSeconds = faculty.examDuration * 60;

  // Select random problems from this faculty
  const availableProblems = await db
    .select({ id: problems.id })
    .from(problems)
    .where(and(eq(problems.facultyId, facultyId), eq(problems.isPublished, true)))
    .orderBy(sql`RANDOM()`)
    .limit(numProblems);

  if (availableProblems.length === 0) {
    return NextResponse.json({ error: "Nema dostupnih zadataka za ovaj fakultet" }, { status: 400 });
  }

  // Create exam
  const [exam] = await db.insert(mockExams).values({
    userId,
    facultyId,
    durationLimit: durationSeconds,
    status: "in_progress",
  }).returning();

  // Create exam problems
  const examProblemValues = availableProblems.map((p, i) => ({
    examId: exam.id,
    problemId: p.id,
    position: i + 1,
  }));

  await db.insert(mockExamProblems).values(examProblemValues);

  return NextResponse.json({ examId: exam.id });
}
