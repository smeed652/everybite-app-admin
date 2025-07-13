#!/usr/bin/env node
/**
 * Codemod: prepend hierarchical prefix to Storybook titles.
 * If a .stories.tsx file has a title that does not include a slash (/),
 * it will be updated to `UI/<Title>`.
 * Run with: node scripts/codemodStoryTitles.js
 */
const fs = require('fs');
const path = require('path');
const glob = require('glob');

const ROOT = path.resolve(__dirname, '..');
const STORY_GLOB = path.join(ROOT, 'src', '**', '*.stories.@(ts|tsx)');

const files = glob.sync(STORY_GLOB, { nodir: true, strict: false, silent: true });

let updated = 0;

files.forEach((file) => {
  const content = fs.readFileSync(file, 'utf8');
  const lines = content.split(/\r?\n/);
  let changed = false;

  const newLines = lines.map((line) => {
    const match = line.match(/title:\s*'([^']+)'/);
    if (match) {
      const current = match[1];
      if (!current.includes('/')) {
        const updatedTitle = `UI/${current}`;
        changed = true;
        return line.replace(current, updatedTitle);
      }
    }
    return line;
  });

  if (changed) {
    fs.writeFileSync(file, newLines.join('\n'));
    updated += 1;
    console.log(`Updated title in ${path.relative(ROOT, file)}`);
  }
});

console.log(`Codemod complete. Updated ${updated} file(s).`);
