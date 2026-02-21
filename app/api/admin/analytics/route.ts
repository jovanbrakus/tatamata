import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { users, problems, mockExams, aiSolutions } from "@/drizzle/schema";
import { sql } from "drizzle-orm";
import { NextResponse } from "next/server";

export async function GET() {
  const session = await auth();
  if (!session?.user || (session.user as any).role !== "admin") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }

  const [usersCount, problemsCount, examsCount, aiCount] = await Promise.all([
    db.select({ count: sql<number>`count(*)` }).from(users),
    db.select({ count: sql<number>`count(*)` }).from(problems),
    db.select({ count: sql<number>`count(*)` }).from(mockExams),
    db.select({ count: sql<number>`count(*)` }).from(aiSolutions),
  ]);

  return NextResponse.json({
    totalUsers: Number(usersCount[0]?.count ?? 0),
    totalProblems: Number(problemsCount[0]?.count ?? 0),
    totalExams: Number(examsCount[0]?.count ?? 0),
    totalAiSolutions: Number(aiCount[0]?.count ?? 0),
  });
}
