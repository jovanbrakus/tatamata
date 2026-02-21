import type { LLMProvider, LLMProviderName } from "./types";
import { AnthropicProvider } from "./anthropic";
import { OpenAIProvider } from "./openai";
import { GoogleProvider } from "./google";

export function createLLMProvider(model?: string): LLMProvider {
  const provider = (process.env.LLM_PROVIDER || "anthropic") as LLMProviderName;

  switch (provider) {
    case "anthropic":
      return new AnthropicProvider(model);
    case "openai":
      return new OpenAIProvider(model);
    case "google":
      return new GoogleProvider(model);
    default:
      throw new Error(`Unknown LLM provider: ${provider}`);
  }
}
