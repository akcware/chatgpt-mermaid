#!/usr/bin/env node

/**
 * Post-processing script to add .js extensions to relative imports
 * Required for ES modules to work properly in Node.js
 */

import { readdir, readFile, writeFile } from 'fs/promises';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const distDir = join(__dirname, '..', 'dist');

async function processFile(filePath) {
  const content = await readFile(filePath, 'utf-8');
  
  // Replace relative imports without .js extension
  const updated = content.replace(
    /from\s+['"](\.\.[\/\\][^'"]+|\.\/[^'"]+)['"]/g,
    (match, importPath) => {
      // Skip if already has .js extension
      if (importPath.endsWith('.js')) {
        return match;
      }
      // Add .js extension
      return match.replace(importPath, `${importPath}.js`);
    }
  );
  
  if (content !== updated) {
    await writeFile(filePath, updated, 'utf-8');
    console.log(`Fixed: ${filePath}`);
  }
}

async function processDirectory(dir) {
  const entries = await readdir(dir, { withFileTypes: true });
  
  for (const entry of entries) {
    const fullPath = join(dir, entry.name);
    
    if (entry.isDirectory()) {
      await processDirectory(fullPath);
    } else if (entry.isFile() && entry.name.endsWith('.js')) {
      await processFile(fullPath);
    }
  }
}

console.log('Adding .js extensions to relative imports in dist/...');
await processDirectory(distDir);
console.log('Done!');

