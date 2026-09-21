import { fileURLToPath } from 'node:url';
import { defineConfig } from 'vitest/config';

export default defineConfig({
  // tsconfig's "jsx": "preserve" is for Next; tests need React's automatic runtime to render components.
  esbuild: { jsx: 'automatic' },
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
      'server-only': fileURLToPath(new URL('./test/server-only-stub.ts', import.meta.url)),
    },
  },
  test: {
    // Component tests opt in per-file with `// @vitest-environment jsdom`; everything else stays on
    // the faster node environment.
    setupFiles: ['./vitest.setup.ts'],
  },
});
