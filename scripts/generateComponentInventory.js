#!/usr/bin/env node
// generateComponentInventory – list exported React components as JSON
// Usage: node scripts/generateComponentInventory.js > component-inventory.json
const { readdirSync, readFileSync, statSync } = require('fs');
const { join, extname } = require('path');

const SRC_DIR = join(__dirname, '..', 'src');

// Directories to scan, relative to project root
const TARGET_DIRS = [
  join(SRC_DIR, 'components'),
  // Any depth `components` folder under features
  ...globFeaturesComponents(join(SRC_DIR, 'features')),
];

function globFeaturesComponents(featuresDir) {
  const results = [];
  if (!exists(featuresDir)) return results;
  for (const feature of readdirSync(featuresDir)) {
    const compDir = join(featuresDir, feature, 'components');
    if (exists(compDir)) results.push(compDir);
  }
  return results;
}

function exists(p) {
  try {
    return statSync(p).isDirectory();
  } catch {
    return false;
  }
}

const EXPORT_REGEX = /export\s+(?:default\s+)?(?:function|const|class)\s+([A-Z][A-Za-z0-9_]*)/g;
const IGNORED_EXTS = new Set(['.stories.tsx', '.test.tsx']);

/** Recursively walk a directory and collect .tsx files */
function walk(dir, files = []) {
  for (const name of readdirSync(dir)) {
    const path = join(dir, name);
    const stat = statSync(path);
    if (stat.isDirectory()) {
      walk(path, files);
    } else if (stat.isFile() && extname(name) === '.tsx' && !ignored(name)) {
      files.push(path);
    }
  }
  return files;
}

function ignored(filename) {
  return [...IGNORED_EXTS].some((ext) => filename.endsWith(ext));
}

function collect() {
  const inventory = [];
  for (const dir of TARGET_DIRS) {
    for (const file of walk(dir)) {
      const content = readFileSync(file, 'utf-8');
      let match;
      while ((match = EXPORT_REGEX.exec(content)) !== null) {
        const [, name] = match;
        inventory.push({ name, file: file.replace(process.cwd() + '/', '') });
      }
    }
  }
  return inventory;
}

const result = collect();
console.log(JSON.stringify(result, null, 2));