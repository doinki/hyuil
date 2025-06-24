// @ts-check

import { join } from 'node:path';

import { config, includeIgnoreFile } from 'eslint-config-mado';
import { generateConfig as generateImportConfig } from 'eslint-config-mado/import';
import { generateConfig as generateJsConfig } from 'eslint-config-mado/javascript';
import { generateConfig as generatePrettierConfig } from 'eslint-config-mado/prettier';
import { generateConfig as generateSortConfig } from 'eslint-config-mado/sort';
import { generateConfig as generateTsConfig } from 'eslint-config-mado/typescript';
import { generateConfig as generateUnicornConfig } from 'eslint-config-mado/unicorn';

const gitignorePath = join(import.meta.dirname, '.gitignore');

export default config([
  includeIgnoreFile(gitignorePath),
  generateJsConfig(),
  generateTsConfig(),
  generateImportConfig(),
  generateUnicornConfig(),
  generateSortConfig(),
  generatePrettierConfig(),
]);
