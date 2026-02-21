import { GoogleGenerativeAI } from "@google/generative-ai";
import type { LLMProvider, SolutionRequest, SolutionResponse } from "./types";
import { getSystemPrompt } from "./prompt";
import { parseLLMResponse } from "./parser";
import { calculateCost } from "./pricing";

export class GoogleProvider implements LLMProvider {
  private client: GoogleGenerativeAI;
  private model: string;

  constructor(model?: string) {
    this.client = new GoogleGenerativeAI(process.env.GOOGLE_AI_API_KEY!);
    this.model = model || process.env.LLM_MODEL || "gemini-2.0-flash";
  }

  async generateSolution(request: SolutionRequest): Promise<SolutionResponse> {
    const model = this.client.getGenerativeModel({
      model: this.model,
      systemInstruction: getSystemPrompt(),
    });

    const parts: Array<{ text: string } | { inlineData: { mimeType: string; data: string } }> = [];

    if (request.promptText) {
      parts.push({ text: request.promptText });
    }

    if (request.screenshotBase64 && request.screenshotMimeType) {
      parts.push({
        inlineData: {
          mimeType: request.screenshotMimeType,
          data: request.screenshotBase64,
        },
      });
    }

    const startTime = Date.now();
    const result = await model.generateContent(parts);
    const latencyMs = Date.now() - startTime;

    const response = result.response;
    const raw = response.text();
    const parsed = parseLLMResponse(raw, request.promptText);

    const usage = response.usageMetadata;
    const inputTokens = usage?.promptTokenCount ?? 0;
    const outputTokens = usage?.candidatesTokenCount ?? 0;
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
