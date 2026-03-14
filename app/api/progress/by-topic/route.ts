import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { problemProgress } from "@/drizzle/schema";
import { eq } from "drizzle-orm";
import { NextResponse } from "next/server";
import { getAllMeta, getCategories } from "@/lib/problems";

export async function GET() {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const userId = (session.user as any).id;

  const allMeta = getAllMeta();
  const totalByCategory: Record<string, number> = {};
  const idToCategory = new Map<string, string>();
  for (const p of allMeta) {
    if (p.category) {
      totalByCategory[p.category] = (totalByCategory[p.category] ?? 0) + 1;
      idToCategory.set(p.id, p.category);
    }
  }

  const progressRows = await db
    .select({
      problemId: problemProgress.problemId,
      status: problemProgress.status,
    })
    .from(problemProgress)
    .where(eq(problemProgress.userId, userId));

  const solvedByCategory: Record<string, number> = {};
  for (const row of progressRows) {
    if (row.status === "solved") {
      const cat = idToCategory.get(row.problemId);
      if (cat) {
        solvedByCategory[cat] = (solvedByCategory[cat] ?? 0) + 1;
      }
    }
  }

  const categories = getCategories();
  const categoryNames: Record<string, string> = {};
  for (const c of categories) {
    categoryNames[c.id] = c.sr;
  }

  const result = Object.entries(totalByCategory).map(([categoryId, total]) => ({
    topic_id: categoryId,
    name: categoryNames[categoryId] ?? categoryId,
    total,
    solved: solvedByCategory[categoryId] ?? 0,
  }));

  result.sort((a, b) => a.name.localeCompare(b.name));

  return NextResponse.json(result);
}
