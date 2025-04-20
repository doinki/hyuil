import { defineConfig } from 'tsup';

export default defineConfig({
  clean: true,
  entry: ['src/app.ts'],
  env: {
    NODE_ENV: 'production',
  },
  format: 'esm',
  target: 'node22.14',
  treeshake: true,
});
