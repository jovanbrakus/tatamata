/**
 * Generate category background images using Gemini image generation.
 * Run: GEMINI_API_KEY=... npx tsx scripts/generate-category-images.ts
 */
import { GoogleGenAI } from "@google/genai";
import fs from "fs";
import path from "path";

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
if (!GEMINI_API_KEY) {
  console.error("GEMINI_API_KEY is required");
  process.exit(1);
}

const ai = new GoogleGenAI({ apiKey: GEMINI_API_KEY });
const OUTPUT_DIR = path.join(process.cwd(), "public/images/categories");

const CATEGORIES: Record<string, string> = {
  algebra: `A stunning wide-format abstract mathematical illustration for "Algebra".
Dark moody background (#0a0705 to #1a1210 gradient).
Floating translucent golden-amber algebraic symbols and equations: x², √, ±, Σ, polynomial curves, matrix brackets — all rendered as luminous glass-like 3D objects with soft orange glow and bokeh light particles.
Subtle grid lines fading into darkness.
Cinematic lighting from the left side casting warm amber reflections.
Ultra-wide 21:9 aspect ratio, photorealistic CGI render, 8K quality, depth of field blur on edges.
Style: dark academia meets futuristic holographic display. No text or labels.`,

  trigonometry: `A stunning wide-format abstract mathematical illustration for "Trigonometry".
Dark moody background (#0a0705 to #1a1210 gradient).
A luminous unit circle made of soft rose-pink light with sine and cosine waves emanating outward like sound waves.
Floating translucent triangles with glowing vertices, arc angle markers rendered as light trails.
Subtle wave interference patterns in the background.
Rose-pink and magenta color scheme with soft bloom effects.
Cinematic lighting, photorealistic CGI render, 8K quality, depth of field.
Style: ethereal mathematical visualization, holographic aesthetic. No text or labels.`,

  geometry: `A stunning wide-format abstract mathematical illustration for "Geometry".
Dark moody background (#0a0705 to #1a1210 gradient).
Floating translucent Platonic solids — icosahedron, dodecahedron, tetrahedron — made of sky-blue luminous glass with visible edges and vertices.
Golden ratio spirals and compass construction lines as faint light traces.
Scattered geometric shapes: circles, triangles, hexagons with soft cyan and electric blue glow.
Subtle reflection on a dark surface below.
Cinematic lighting, photorealistic CGI render, 8K quality, tilt-shift depth of field.
Style: sacred geometry meets sci-fi blueprint hologram. No text or labels.`,

  analysis: `A stunning wide-format abstract mathematical illustration for "Mathematical Analysis".
Dark moody background (#0a0705 to #1a1210 gradient).
Luminous cyan function curves flowing through 3D space — parabolas, exponentials, sine curves rendered as glowing light ribbons.
A tangent line touching a curve with a bright spark at the point of contact (representing derivatives).
Limit approaching arrows and integral area fills rendered as translucent cyan planes.
Coordinate axes as faint grid of light.
Teal and cyan color scheme with soft particle effects.
Cinematic lighting, photorealistic CGI render, 8K quality, depth of field.
Style: data visualization art meets abstract mathematics. No text or labels.`,

  combinatorics_and_probability: `A stunning wide-format abstract mathematical illustration for "Combinatorics and Probability".
Dark moody background (#0a0705 to #1a1210 gradient).
Floating translucent dice, playing cards, and Pascal's triangle rendered as luminous emerald-green glass objects.
Network graph connections shown as glowing green light threads between nodes.
Tree diagram branches spreading outward with probability values as soft light dots.
Scattered permutation symbols and factorial spirals as decorative elements.
Emerald green and gold color scheme with soft bloom and bokeh particles.
Cinematic lighting, photorealistic CGI render, 8K quality, depth of field.
Style: elegant mathematical art, dark luxury aesthetic. No text or labels.`,
};

async function generateImage(categoryId: string, prompt: string) {
  console.log(`Generating image for: ${categoryId}...`);

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3.1-flash-image-preview",
      contents: prompt,
      config: {
        responseModalities: ["image", "text"],
      },
    });

    // Extract image from response
    if (response.candidates && response.candidates[0]) {
      const parts = response.candidates[0].content?.parts ?? [];
      for (const part of parts) {
        if (part.inlineData && part.inlineData.data) {
          const buffer = Buffer.from(part.inlineData.data, "base64");
          const outputPath = path.join(OUTPUT_DIR, `${categoryId}.png`);
          fs.writeFileSync(outputPath, buffer);
          console.log(`  ✓ Saved: ${outputPath} (${(buffer.length / 1024).toFixed(0)}KB)`);
          return true;
        }
      }
    }

    console.log(`  ✗ No image data in response for ${categoryId}`);
    return false;
  } catch (error: any) {
    console.error(`  ✗ Error for ${categoryId}:`, error.message || error);
    return false;
  }
}

async function main() {
  fs.mkdirSync(OUTPUT_DIR, { recursive: true });
  console.log(`Output directory: ${OUTPUT_DIR}\n`);

  for (const [id, prompt] of Object.entries(CATEGORIES)) {
    await generateImage(id, prompt);
    // Small delay between requests to avoid rate limiting
    await new Promise((r) => setTimeout(r, 2000));
  }

  console.log("\nDone!");
}

main();
