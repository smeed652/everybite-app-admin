#!/usr/bin/env node
// scaffoldMissingStories.js – create simple default Storybook stories for components lacking them
/* eslint-disable no-console */
const { readFileSync, readFile, writeFileSync, existsSync, mkdirSync } = require('fs');
const { join, dirname, basename, extname, relative } = require('path');
const { execSync } = require('child_process');

const projectRoot = join(__dirname, '..');
const inventoryPath = join(projectRoot, 'component-inventory.json');
let inventory;
try {
  inventory = JSON.parse(readFileSync(inventoryPath, 'utf8'));
} catch {
  console.error('Please generate component-inventory.json first');
  process.exit(1);
}

let created = 0;
for (const { name, file } of inventory) {
  const storyPath = join(projectRoot, file.replace(/\.tsx$/, '.stories.tsx'));
  if (existsSync(storyPath)) continue; // already exists
  const componentDir = dirname(storyPath);
  if (!existsSync(componentDir)) mkdirSync(componentDir, { recursive: true });

  const importPath = './' + basename(file, '.tsx');
  const story = `import type { Meta, StoryObj } from '@storybook/react';\n` +
    `import { ${name} } from '${importPath}';\n\n` +
    `const meta: Meta<typeof ${name}> = {\n  title: '${name}',\n  component: ${name},\n};\nexport default meta;\n\ntype Story = StoryObj<typeof ${name}>;\n\nexport const Default: Story = {\n  args: {},\n};\n`;
  writeFileSync(storyPath, story);
  created += 1;
  console.log('Created', relative(projectRoot, storyPath));
}

console.log(`Scaffolded ${created} new stories.`);
