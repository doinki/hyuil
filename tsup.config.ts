import { defineConfig } from 'tsup';

export default defineConfig({
  clean: true,
  entry: ['src/app.ts'],
  env: {
    NODE_ENV: 'production',
  },
  format: 'esm',
  target: 'es2023',
  treeshake: true,
});
