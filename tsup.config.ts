import { defineConfig } from 'tsup';

export default defineConfig({
  clean: true,
  entry: ['src/app.ts'],
  env: {
    NODE_ENV: 'production',
  },
  format: 'esm',
  minifyWhitespace: true,
  target: 'node22.17',
  treeshake: true,
});
