import { requireAdmin } from "@/lib/admin";
import { db } from "@/lib/db";
import { users, mockExams, aiSolutions } from "@/drizzle/schema";
import { sql, gte } from "drizzle-orm";
import { NextResponse } from "next/server";
import { getProblemsCount } from "@/lib/problems";

export async function GET() {
  const session = await requireAdmin();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }

  const today = new Date().toISOString().slice(0, 10);
  const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();

  const [usersCount, examsCount, aiCount, activeToday, newThisWeek] = await Promise.all([
    db.select({ count: sql<number>`count(*)` }).from(users),
    db.select({ count: sql<number>`count(*)` }).from(mockExams),
    db.select({ count: sql<number>`count(*)` }).from(aiSolutions),
    db.select({ count: sql<number>`count(*)` }).from(users).where(sql`${users.lastActiveDate} = ${today}`),
    db.select({ count: sql<number>`count(*)` }).from(users).where(gte(users.createdAt, new Date(weekAgo))),
  ]);

  return NextResponse.json({
    totalUsers: Number(usersCount[0]?.count ?? 0),
    totalProblems: getProblemsCount(),
    totalExams: Number(examsCount[0]?.count ?? 0),
    totalAiSolutions: Number(aiCount[0]?.count ?? 0),
    activeUsersToday: Number(activeToday[0]?.count ?? 0),
    newUsersThisWeek: Number(newThisWeek[0]?.count ?? 0),
  });
}
