import { defineConfig } from 'tsdown';

export default defineConfig([
  {
    entry: ['src/index.ts'],
    format: ['esm', 'cjs'],
    platform: 'node',
    dts: true,
    sourcemap: true,
    clean: true,
  },
  {
    entry: { 'juanfi-hotspot.bundle': 'src/index.ts' },
    format: ['iife'],
    platform: 'browser',
    globalName: 'JuanFiHotspot',
    minify: true,
    sourcemap: true,
  },
]);