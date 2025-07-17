#!/usr/bin/env node
/**
 * Codemod: promote UI stories into 2-level bucket hierarchy.
 *   UI/Inputs/Button   UI/Overlay/Modal   UI/Data Display/Table   UI/Layout/Grid
 * Leaves Forms/, Features/… untouched.
 *
 * Usage: node scripts/codemodStoryBuckets.js
 */
const fs = require('fs');
const path = require('path');
const glob = require('glob');

const ROOT = path.resolve(__dirname, '..');
const STORY_GLOB = path.join(ROOT, 'src', '**', '*.stories.@(ts|tsx)');

const INPUTS = [
  'Button',
  'Input',
  'Checkbox',
  'Label',
  'Switch',
  'Toggle',
  'Select',
  'DropdownMenu',
  'FormField',
  'FormSection',
];
const OVERLAY = [
  'Modal',
  'Drawer',
  'Sheet',
  'Dialog',
  'Toast',
  'ToastProvider',
  'Popover',
  'Command',
];
const DATA_DISPLAY = [
  'Table',
  'DataTable',
  'Skeleton',
  'LegendItem',
  'ConcentricDonutChart',
  'DonutStatCard',
  'TrendsChart',
  'ColorRow',
];
const LAYOUT = [
  'Grid',
  'Panel',
  'Section',
  'Card',
  'Separator',
  'Stack',
  'Prose',
];

const categorize = (name) => {
  if (INPUTS.includes(name)) return 'Inputs';
  if (OVERLAY.includes(name)) return 'Overlay';
  if (DATA_DISPLAY.includes(name)) return 'Data Display';
  if (LAYOUT.includes(name)) return 'Layout';
  return 'Misc';
};

const files = glob.sync(STORY_GLOB, { nodir: true, strict: false, silent: true });
let updated = 0;
files.forEach((file) => {
  const content = fs.readFileSync(file, 'utf8');
  const lines = content.split(/\r?\n/);
  let changed = false;

  const newLines = lines.map((line) => {
    const m = line.match(/title:\s*'UI\/([^']+)'/);
    if (m) {
      const compName = m[1];
      if (!compName.includes('/')) {
        const bucket = categorize(compName);
        const newTitle = `UI/${bucket}/${compName}`;
        changed = true;
        return line.replace(`UI/${compName}`, newTitle);
      }
    }
    return line;
  });

  if (changed) {
    fs.writeFileSync(file, newLines.join('\n'));
    updated += 1;
    console.log(`Bucketed ${path.relative(ROOT, file)}`);
  }
});

console.log(`Bucket codemod complete. Updated ${updated} file(s).`);
