import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { problemProgress } from "@/drizzle/schema";
import { eq } from "drizzle-orm";
import { NextResponse } from "next/server";
import { getAllMeta } from "@/lib/problems";

export async function GET() {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const userId = (session.user as any).id;

  const allMeta = getAllMeta();
  const totalByFaculty: Record<string, number> = {};
  const idToFaculty = new Map<string, string>();
  for (const p of allMeta) {
    totalByFaculty[p.facultyId] = (totalByFaculty[p.facultyId] ?? 0) + 1;
    idToFaculty.set(p.id, p.facultyId);
  }

  const progressRows = await db
    .select({
      problemId: problemProgress.problemId,
      status: problemProgress.status,
    })
    .from(problemProgress)
    .where(eq(problemProgress.userId, userId));

  const solvedByFaculty: Record<string, number> = {};
  for (const row of progressRows) {
    if (row.status === "solved") {
      const faculty = idToFaculty.get(row.problemId);
      if (faculty) {
        solvedByFaculty[faculty] = (solvedByFaculty[faculty] ?? 0) + 1;
      }
    }
  }

  const result = Object.entries(totalByFaculty).map(([facultyId, total]) => ({
    faculty_id: facultyId,
    short_name: facultyId,
    total,
    solved: solvedByFaculty[facultyId] ?? 0,
  }));

  result.sort((a, b) => a.short_name.localeCompare(b.short_name));

  return NextResponse.json(result);
}
