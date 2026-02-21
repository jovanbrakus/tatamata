import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { aiSolutions, problems } from "@/drizzle/schema";
import { eq } from "drizzle-orm";
import { NextResponse } from "next/server";
import { createLLMProvider } from "@/lib/llm/factory";
import { getContextualPrompt } from "@/lib/llm/prompt";
import { parseLLMResponse } from "@/lib/llm/parser";
import { calculateCost } from "@/lib/llm/pricing";
import { checkAiRateLimit, incrementAiUsage } from "@/lib/utils/rate-limit";

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const userId = (session.user as any).id;

  const { allowed, used, limit } = await checkAiRateLimit(userId);
  if (!allowed) {
    return NextResponse.json({ error: "Iskoristio si sve AI zahteve za danas. Dođi sutra!", used, limit }, { status: 429 });
  }

  const { sourceProblemId, contextHint } = await req.json();

  if (!sourceProblemId || !contextHint) {
    return NextResponse.json({ error: "Nedostaje ID zadatka ili pitanje." }, { status: 400 });
  }

  // Get the source problem HTML
  const problem = await db.select({ htmlContent: problems.htmlContent }).from(problems).where(eq(problems.id, sourceProblemId)).limit(1);
  if (problem.length === 0) return NextResponse.json({ error: "Zadatak nije pronađen." }, { status: 404 });

  const contextualPrompt = getContextualPrompt(problem[0].htmlContent, contextHint);

  try {
    const provider = createLLMProvider();
    const result = await provider.generateSolution({ promptText: contextualPrompt });

    const [solution] = await db.insert(aiSolutions).values({
      userId,
      contextType: "contextual",
      sourceProblemId,
      title: result.title,
      contextHint,
      htmlContent: result.html,
      llmProvider: process.env.LLM_PROVIDER || "anthropic",
      llmModel: process.env.LLM_MODEL || "claude-sonnet-4-5-20250929",
      inputTokens: result.tokenUsage.inputTokens,
      outputTokens: result.tokenUsage.outputTokens,
      costUsd: result.costUsd.toFixed(6),
      latencyMs: result.latencyMs,
    }).returning();

    await incrementAiUsage(userId);

    return NextResponse.json({ id: solution.id, title: result.title });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "AI greška" }, { status: 500 });
  }
}
