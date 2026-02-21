import { db } from "@/lib/db";
import { problems, problemTopics, topics } from "@/drizzle/schema";
import { eq } from "drizzle-orm";
import { NextResponse } from "next/server";

export async function GET(req: Request, { params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;

  const result = await db
    .select()
    .from(problems)
    .where(eq(problems.slug, slug))
    .limit(1);

  if (result.length === 0) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const problem = result[0];

  const topicRows = await db
    .select({ id: topics.id, name: topics.name })
    .from(problemTopics)
    .innerJoin(topics, eq(problemTopics.topicId, topics.id))
    .where(eq(problemTopics.problemId, problem.id));

  return NextResponse.json({
    ...problem,
    htmlContent: undefined, // Don't send full HTML in metadata
    topics: topicRows,
  });
}
