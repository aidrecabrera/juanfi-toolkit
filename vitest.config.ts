import { fileURLToPath } from 'node:url';
import { defineConfig } from 'vitest/config';

export default defineConfig({
  resolve: {
    alias: {
      '@svene/juanfi-api': fileURLToPath(new URL('./packages/api/src/index.ts', import.meta.url)),
      '@svene/juanfi-hotspot': fileURLToPath(new URL('./packages/hotspot/src/index.ts', import.meta.url)),
    },
  },
  test: {
    globals: true,
    environment: 'node',
    include: ['packages/**/*.test.ts'],
  },
});
