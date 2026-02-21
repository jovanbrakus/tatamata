export interface LLMProvider {
  generateSolution(request: SolutionRequest): Promise<SolutionResponse>;
}

export interface SolutionRequest {
  promptText?: string;
  screenshotBase64?: string;
  screenshotMimeType?: string;
}

export interface SolutionResponse {
  html: string;
  title: string;
  tokenUsage: {
    inputTokens: number;
    outputTokens: number;
  };
  costUsd: number;
  latencyMs: number;
}

export type LLMProviderName = "anthropic" | "openai" | "google";
