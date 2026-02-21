interface ParsedResponse {
  html: string;
  title: string;
}

export function parseLLMResponse(raw: string, fallbackPrompt?: string): ParsedResponse {
  const htmlMatch = raw.match(/(<!DOCTYPE html[\s\S]*?<\/html>)/i);
  const html = htmlMatch ? htmlMatch[1] : raw;

  const metaMatch = raw.match(/<!--BRAINSPARK_META\s*([\s\S]*?)\s*BRAINSPARK_META-->/);

  let title = fallbackPrompt?.slice(0, 100) || "AI Rešenje";

  if (metaMatch) {
    try {
      const meta = JSON.parse(metaMatch[1]);
      if (meta.subject === "rejected") {
        throw new Error(meta.title || "Ovaj sadržaj nije prikladan.");
      }
      if (meta.title) title = meta.title;
    } catch (err) {
      if (!(err instanceof SyntaxError)) throw err;
    }
  }

  return { html, title };
}
