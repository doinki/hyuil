import { readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

const filePath = join(import.meta.dirname, '../build/index.js');
const content = readFileSync(filePath, 'utf8');
writeFileSync(filePath, '#!/usr/bin/env node\n' + content, 'utf8');
