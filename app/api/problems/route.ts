import { db } from "@/lib/db";
import { problems, faculties, problemTopics, topics } from "@/drizzle/schema";
import { eq, and, ilike, sql, desc, asc, inArray } from "drizzle-orm";
import { NextResponse } from "next/server";

export async function GET(req: Request) {
  const url = new URL(req.url);
  const faculty = url.searchParams.get("faculty");
  const year = url.searchParams.get("year");
  const topic = url.searchParams.get("topic");
  const search = url.searchParams.get("search");
  const page = parseInt(url.searchParams.get("page") || "1");
  const limit = parseInt(url.searchParams.get("limit") || "30");
  const offset = (page - 1) * limit;

  const conditions = [eq(problems.isPublished, true)];

  if (faculty) conditions.push(eq(problems.facultyId, faculty));
  if (year) conditions.push(eq(problems.year, parseInt(year)));
  if (search) conditions.push(ilike(problems.title, `%${search}%`));

  let query;
  if (topic) {
    // Join with problem_topics to filter by topic
    const problemIds = await db
      .select({ problemId: problemTopics.problemId })
      .from(problemTopics)
      .where(eq(problemTopics.topicId, topic));

    const ids = problemIds.map((r) => r.problemId);
    if (ids.length === 0) {
      return NextResponse.json({ problems: [], total: 0, page, limit });
    }
    conditions.push(inArray(problems.id, ids));
  }

  const where = and(...conditions);

  const [data, countResult] = await Promise.all([
    db
      .select({
        id: problems.id,
        slug: problems.slug,
        title: problems.title,
        facultyId: problems.facultyId,
        year: problems.year,
        problemNumber: problems.problemNumber,
        numOptions: problems.numOptions,
        difficulty: problems.difficulty,
      })
      .from(problems)
      .where(where)
      .orderBy(asc(problems.facultyId), desc(problems.year), asc(problems.problemNumber))
      .limit(limit)
      .offset(offset),
    db
      .select({ count: sql<number>`count(*)` })
      .from(problems)
      .where(where),
  ]);

  return NextResponse.json({
    problems: data,
    total: Number(countResult[0]?.count ?? 0),
    page,
    limit,
  });
}
