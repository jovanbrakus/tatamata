import Anthropic from "@anthropic-ai/sdk";
import type { LLMProvider, SolutionRequest, SolutionResponse } from "./types";
import { getSystemPrompt } from "./prompt";
import { parseLLMResponse } from "./parser";
import { calculateCost } from "./pricing";

export class AnthropicProvider implements LLMProvider {
  private client: Anthropic;
  private model: string;

  constructor(model?: string) {
    this.client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY! });
    this.model = model || process.env.LLM_MODEL || "claude-sonnet-4-5-20250929";
  }

  async generateSolution(request: SolutionRequest): Promise<SolutionResponse> {
    const content: Anthropic.MessageCreateParams["messages"][0]["content"] = [];

    if (request.screenshotBase64 && request.screenshotMimeType) {
      content.push({
        type: "image",
        source: {
          type: "base64",
          media_type: request.screenshotMimeType as "image/jpeg" | "image/png" | "image/gif" | "image/webp",
          data: request.screenshotBase64,
        },
      });
    }

    if (request.promptText) {
      content.push({ type: "text", text: request.promptText });
    }

    const startTime = Date.now();
    const response = await this.client.messages.create({
      model: this.model,
      max_tokens: 16000,
      system: getSystemPrompt(),
      messages: [{ role: "user", content }],
    });
    const latencyMs = Date.now() - startTime;

    const raw = response.content
      .filter((b): b is Anthropic.TextBlock => b.type === "text")
      .map((b) => b.text)
      .join("");

    const parsed = parseLLMResponse(raw, request.promptText);
    const inputTokens = response.usage.input_tokens;
    const outputTokens = response.usage.output_tokens;
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
