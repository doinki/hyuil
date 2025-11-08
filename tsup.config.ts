import { defineConfig } from 'tsup';

export default defineConfig({
  clean: true,
  entry: ['src/app.ts'],
  env: {
    NODE_ENV: 'production',
  },
  format: 'esm',
  minify: true,
  target: 'node24.11',
  treeshake: true,
});
