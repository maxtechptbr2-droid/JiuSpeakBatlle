import { runAssetGenerationPipeline } from '../asset-factory/scripts/generate-assets.ts';

console.log('[WRAPPER] Redirecting asset generation to JiuSpeak Asset Factory V3 module...');
runAssetGenerationPipeline().catch((err) => {
  console.error('[WRAPPER FATAL ERROR] Asset generation failed:', err);
  process.exit(1);
});
