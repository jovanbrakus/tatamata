import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { sql } from "drizzle-orm";
import { NextResponse } from "next/server";

export async function GET() {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const userId = (session.user as any).id;

  const result = await db.execute(sql`
    SELECT
      t.id as topic_id,
      t.name,
      COUNT(DISTINCT pt.problem_id) as total,
      COUNT(DISTINCT CASE WHEN pp.status = 'solved' THEN pt.problem_id END) as solved
    FROM topics t
    JOIN problem_topics pt ON pt.topic_id = t.id
    JOIN problems p ON p.id = pt.problem_id AND p.is_published = true
    LEFT JOIN problem_progress pp ON pp.problem_id = pt.problem_id AND pp.user_id = ${userId}
    GROUP BY t.id, t.name
    ORDER BY t.name
  `);

  return NextResponse.json(result.rows);
}
