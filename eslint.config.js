// @ts-check

import { join } from 'node:path';

import { defineConfig, includeIgnoreFile } from 'eslint-config-mado';
import * as importConfig from 'eslint-config-mado/import';
import * as jsConfig from 'eslint-config-mado/javascript';
import * as prettierConfig from 'eslint-config-mado/prettier';
import * as sortConfig from 'eslint-config-mado/sort';
import * as tsConfig from 'eslint-config-mado/typescript';
import * as unicornConfig from 'eslint-config-mado/unicorn';

const gitignore = join(import.meta.dirname, '.gitignore');

export default defineConfig(
  includeIgnoreFile(gitignore),
  jsConfig.defineConfig(),
  tsConfig.defineConfig({
    tsconfigRootDir: import.meta.dirname,
  }),
  importConfig.defineConfig(),
  unicornConfig.defineConfig(),
  sortConfig.defineConfig(),
  prettierConfig.defineConfig(),
  {
    rules: {
      '@typescript-eslint/no-misused-promises': 'off',
    },
  },
);
