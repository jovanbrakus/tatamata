import { getProblemFull, queryProblems } from "@/lib/problems";
import { NextResponse } from "next/server";

export async function GET(req: Request) {
  const url = new URL(req.url);
  const faculty = url.searchParams.get("faculty") || undefined;
  const year = url.searchParams.get("year");
  const topic = url.searchParams.get("topic") || undefined;
  const topics = url.searchParams.get("topics") || undefined; // comma-separated
  const diffMin = url.searchParams.get("diffMin");
  const diffMax = url.searchParams.get("diffMax");
  const search = url.searchParams.get("search") || undefined;
  const page = parseInt(url.searchParams.get("page") || "1");
  const limit = parseInt(url.searchParams.get("limit") || "30");

  const { problems, total } = queryProblems({
    faculty,
    year: year ? parseInt(year) : undefined,
    category: topic,
    categories: topics ? topics.split(",") : undefined,
    diffMin: diffMin ? parseFloat(diffMin) : undefined,
    diffMax: diffMax ? parseFloat(diffMax) : undefined,
    search,
    page,
    limit,
  });

  return NextResponse.json({
    problems: problems.map((p) => {
      const full = getProblemFull(p.id);
      return {
        id: p.id,
        title: full?.title ?? `Zadatak ${p.problemNumber}`,
        facultyId: p.facultyId,
        year: p.year,
        problemNumber: p.problemNumber,
        numOptions: full?.numOptions ?? 5,
        difficulty: p.difficulty,
        category: p.category,
      };
    }),
    total,
    page,
    limit,
  });
}
