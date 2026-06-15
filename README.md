# JiuSpeak AAA Asset Generator System

A state-of-the-art automated pipeline for compiling, polishing, upscaling, and packaging ultra-high-fidelity game assets and cosmetics designed for the JiuSpeak MMORPG.

---

## Technical Stack & Toolchain

- **Runtime Engine**: Node.js v22+ & TypeScript (`tsx` execution engine)
- **Image Compositor**: `sharp` (High-performance multi-threaded image compiler)
- **Archiving Engine**: `archiver` (High-ratio zlib compression)
- **AI Integrations**: `@google/genai` (Google Gemini & Imagen-4 models)

---

## Quick Start (How to Run)

To instantly generate all **43 Premium Assets** and package them into `JiuSpeak_Assets_AAA.zip`:

1. **Install Dependencies**:
   ```bash
   npm install
   ```

2. **Trigger the Production Pipeline**:
   ```bash
   npm run generate
   ```

3. **Locate Final Outputs**:
   - Organized files are structured inside `/assets/` directory.
   - The final supercompressed ZIP bundle is generated at `/output/JiuSpeak_Assets_AAA.zip`.

---

## System Architecture & Step-By-Step Pipeline

The generation process conforms exactly to the 10 AAA design constraints defined for JiuSpeak:

1. **Category Mapping (Step 1)**: Defines and initializes 43 bespoke assets across 6 structural departments:
   - `Kimonos` (6 items representing top BJJ brands: Atama, Shoyoroll, Hyperfly, etc.)
   - `Rashguards` (5 items: Venum, Tatami, Kingz, etc.)
   - `Medalhas` (5 items: Mundial, Grand Slam, Brasileiro, etc.)
   - `Molduras` (5 items: IBJJF, CBJJ, World Champion, etc.)
   - `Avatares Masculinos` & `Avatares Femininos` (14 items: corresponding to White to Black belt pathways & Masters)
   - `Ícones` (8 items: Minimalist vector menu navigation icons)

2. **Ultra-HD Render Phase (Step 2)**: Sets up default rendering at 2048x2048 canvas density with deep luxury "Black & Gold" finish. If a valid `GEMINI_API_KEY` is present, it connects via Gemini Imagen-4 endpoints. If the key is absent or a network rate limit is reached, it seamlessly delegates to the built-in High-Fidelity SVG canvas constructor to guarantee 100% success.

3. **Backdrop Keying & Transparency (Step 3)**: Applies automatic backdrop-key and color-thresholding filters using `remove-background.ts` to ensure flawless transparent, edge-smoothed boundaries.

4. **AAA Super Resolution (Step 4)**: Executes `upscale-assets.ts` employing standard high-quality Lanczos-3 interpolation and adaptive edge sharpeners (Unsharp Mask filter) to generate 4x upscaled 4096x4096px final game textures.

5. **Optimization (Step 5)**: Sharp generates lossless compressed PNG originals alongside state-of-the-art `.webp` secondary versions for quick web rendering.

6. **Sorting & Manifest (Steps 6 & 7)**: Arranges final files cleanly under `/assets/<category>` folders and writes a structured package meta header database file representing exact properties: `/assets/manifest.json`.

7. **Zipping (Step 8)**: Packs the finalized repository cleanly into `/output/JiuSpeak_Assets_AAA.zip` utilizing max-intensity zlib file compression.

8. **Diagnostic Logs (Step 9)**: Logs entire operations in `/logs/generation.log` and isolates any pipeline failures in `/logs/errors.log` for advanced debugging.

---

## Pipeline Configuration & Customization Manual

### 1. How to Alter Graphic Design Prompts
To modify the texture aesthetic, background atmosphere, or lighting, adjust the `ASSET_LIST` variables located inside `/scripts/generate-assets.ts`. Each item features a distinct `prompt` attribute:

```typescript
const ASSET_LIST = [
  {
    id: "kimono_shoyoroll",
    name: "Shoyoroll Gi",
    category: "kimonos",
    description: "Limited cobiçado kimono...",
    // ALTER THIS PROMPT GRAPHIC DESCRIPTION:
    prompt: "AAA luxury gaming-grade Shoyoroll BJJ Gi, limited black collection, neon golden outlines...",
  }
];
```

### 2. How to Add New Cosmetic Items
To append a new item to the pipeline:
1. Open `/scripts/generate-assets.ts`.
2. Scroll to `ASSET_LIST` array.
3. Append your new custom item structure conforming to the `AssetDef` type.
4. If utilizing procedural generation, update `generateProceduralSVG` inside `generate-assets.ts` to render custom SVG layers matching the new item parameters.

### 3. How to Rotate AI Generation Providers
To change the provider from Google Imagen to others (like Midjourney, DALL-E, or Stable Diffusion):
1. Navigate to `/scripts/generate-assets.ts`.
2. Locate the image generation logic inside `runAssetGenerationPipeline()`:
   ```typescript
   // Locate this block and replace with your alternative API wrapper:
   if (aiClient) {
     const genResponse = await aiClient.models.generateImages({ ... });
   }
   ```
3. Update the package dependencies (e.g. `npm install openai` if migrating to OpenAI DALL-E).
4. Update the environment variables in your workspace `.env` to reference the new key.
