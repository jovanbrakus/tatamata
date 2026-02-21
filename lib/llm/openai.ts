import OpenAI from "openai";
import type { LLMProvider, SolutionRequest, SolutionResponse } from "./types";
import { getSystemPrompt } from "./prompt";
import { parseLLMResponse } from "./parser";
import { calculateCost } from "./pricing";

export class OpenAIProvider implements LLMProvider {
  private client: OpenAI;
  private model: string;

  constructor(model?: string) {
    this.client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY! });
    this.model = model || process.env.LLM_MODEL || "gpt-4o";
  }

  async generateSolution(request: SolutionRequest): Promise<SolutionResponse> {
    const content: OpenAI.ChatCompletionContentPart[] = [];

    if (request.promptText) {
      content.push({ type: "text", text: request.promptText });
    }

    if (request.screenshotBase64 && request.screenshotMimeType) {
      content.push({
        type: "image_url",
        image_url: {
          url: `data:${request.screenshotMimeType};base64,${request.screenshotBase64}`,
        },
      });
    }

    const startTime = Date.now();
    const response = await this.client.chat.completions.create({
      model: this.model,
      max_tokens: 16000,
      messages: [
        { role: "system", content: getSystemPrompt() },
        { role: "user", content },
      ],
    });
    const latencyMs = Date.now() - startTime;

    const raw = response.choices[0]?.message?.content || "";
    const parsed = parseLLMResponse(raw, request.promptText);
    const inputTokens = response.usage?.prompt_tokens ?? 0;
    const outputTokens = response.usage?.completion_tokens ?? 0;
    const costUsd = calculateCost(this.model, inputTokens, outputTokens);

    return {
      html: parsed.html,
      title: parsed.title,
      tokenUsage: { inputTokens, outputTokens },
      costUsd,
      latencyMs,
    };
  }
}
