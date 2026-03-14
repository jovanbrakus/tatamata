import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { users, mockExams, aiSolutions } from "@/drizzle/schema";
import { sql } from "drizzle-orm";
import { NextResponse } from "next/server";
import { getProblemsCount } from "@/lib/problems";

export async function GET() {
  const session = await auth();
  if (!session?.user || (session.user as any).role !== "admin") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }

  const [usersCount, examsCount, aiCount] = await Promise.all([
    db.select({ count: sql<number>`count(*)` }).from(users),
    db.select({ count: sql<number>`count(*)` }).from(mockExams),
    db.select({ count: sql<number>`count(*)` }).from(aiSolutions),
  ]);

  return NextResponse.json({
    totalUsers: Number(usersCount[0]?.count ?? 0),
    totalProblems: getProblemsCount(),
    totalExams: Number(examsCount[0]?.count ?? 0),
    totalAiSolutions: Number(aiCount[0]?.count ?? 0),
  });
}
