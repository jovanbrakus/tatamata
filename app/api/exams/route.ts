import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { mockExams, mockExamProblems, problems, faculties, users } from "@/drizzle/schema";
import { eq, sql } from "drizzle-orm";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const userId = (session.user as any).id;

  // Read user's target faculties from DB
  const [user] = await db
    .select({ targetFaculties: users.targetFaculties })
    .from(users)
    .where(eq(users.id, userId))
    .limit(1);

  const targetFaculties = (user?.targetFaculties as string[]) || [];
  const primaryFaculty = targetFaculties.find(f => f !== "other");

  // Get faculty config — fall back to first available faculty
  let fac = primaryFaculty
    ? await db.select().from(faculties).where(eq(faculties.id, primaryFaculty)).limit(1)
    : [];

  if (fac.length === 0) {
    fac = await db.select().from(faculties).limit(1);
  }

  if (fac.length === 0) {
    return NextResponse.json({ error: "Nema dostupnih fakulteta" }, { status: 400 });
  }

  const faculty = fac[0];
  const numProblems = faculty.examNumProblems;
  const durationSeconds = faculty.examDuration * 60;
  const facultyId = faculty.id;

  // Select random problems from ALL faculties (math is shared)
  const availableProblems = await db
    .select({ id: problems.id })
    .from(problems)
    .where(eq(problems.isPublished, true))
    .orderBy(sql`RANDOM()`)
    .limit(numProblems);

  if (availableProblems.length === 0) {
    return NextResponse.json({ error: "Nema dostupnih zadataka" }, { status: 400 });
  }

  // Point values per position for a 20-problem test
  const fullTestPoints = [3, 3, 4, 4, 4, 4, 4, 5, 5, 5, 5, 5, 5, 6, 6, 6, 6, 6, 7, 7];

  // Create exam
  const [exam] = await db.insert(mockExams).values({
    userId,
    facultyId,
    testSize: "full",
    mode: "timed",
    durationLimit: durationSeconds,
    status: "in_progress",
  }).returning();

  // Create exam problems with point values
  const examProblemValues = availableProblems.map((p, i) => ({
    examId: exam.id,
    problemId: p.id,
    position: i + 1,
    pointValue: String(fullTestPoints[i] ?? 5),
  }));

  await db.insert(mockExamProblems).values(examProblemValues);

  return NextResponse.json({ examId: exam.id });
}
