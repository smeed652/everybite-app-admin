#!/usr/bin/env node
/**
 * Adds a named export mirroring the default export function/component for each provided file.
 * Usage: node scripts/addNamedExports.js <file1> <file2> ...
 */
import { readFileSync, writeFileSync } from 'fs';

function addNamedExport(path) {
  const src = readFileSync(path, 'utf-8');
  // Simple heuristic: look for `export default function Name` or `export default const Name`/`class Name` etc.
  const match = src.match(/export default (function|class|const|let|async function)\s+(\w+)/);
  if (!match) return; // skip if no default func
  const name = match[2];
  if (new RegExp(`export {\\s*${name}\\s*}`).test(src)) return; // already has
  const updated = src.trimEnd() + `\n\nexport { ${name} };\n`;
  writeFileSync(path, updated);
  console.log(`Added named export to ${path}`);
}

const files = process.argv.slice(2);
if (files.length === 0) {
  console.error('Usage: node scripts/addNamedExports.js <file1> <file2> ...');
  process.exit(1);
}
files.forEach(addNamedExport);
