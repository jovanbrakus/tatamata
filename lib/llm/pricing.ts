const LLM_PRICING: Record<string, { inputPerMillion: number; outputPerMillion: number }> = {
  "claude-opus-4-5": { inputPerMillion: 5.0, outputPerMillion: 25.0 },
  "claude-sonnet-4-5-20250929": { inputPerMillion: 3.0, outputPerMillion: 15.0 },
  "claude-haiku-4-5-20251001": { inputPerMillion: 1.0, outputPerMillion: 5.0 },
  "gpt-4o": { inputPerMillion: 2.5, outputPerMillion: 10.0 },
  "gpt-4o-mini": { inputPerMillion: 0.15, outputPerMillion: 0.6 },
  "gpt-4.1": { inputPerMillion: 2.0, outputPerMillion: 8.0 },
  "gpt-4.1-mini": { inputPerMillion: 0.4, outputPerMillion: 1.6 },
  "o4-mini": { inputPerMillion: 1.1, outputPerMillion: 4.4 },
  "gemini-2.5-pro": { inputPerMillion: 1.25, outputPerMillion: 10.0 },
  "gemini-2.5-flash": { inputPerMillion: 0.15, outputPerMillion: 0.6 },
  "gemini-2.0-flash": { inputPerMillion: 0.1, outputPerMillion: 0.4 },
};

export function calculateCost(model: string, inputTokens: number, outputTokens: number): number {
  const pricing = LLM_PRICING[model];
  if (!pricing) return 0;
  return (inputTokens * pricing.inputPerMillion + outputTokens * pricing.outputPerMillion) / 1_000_000;
}
