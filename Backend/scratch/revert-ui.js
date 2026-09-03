const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const currentFile = path.resolve(__dirname, '../../Frontend/src/app/features/reader/reader.component.ts');
const currentContent = fs.readFileSync(currentFile, 'utf8');

// Extract old file directly using git
const oldContent = execSync('git show f61dbfb:"Frontend/src/app/features/reader/reader.component.ts"', { encoding: 'utf8' });

// Extract old template and styles
const templateMatch = oldContent.match(/template:\s*`([\s\S]*?)`,\n\s*styles:\s*\[`([\s\S]*?)`\]/);
if (!templateMatch) {
  console.error("Could not find template/styles in old file.");
  process.exit(1);
}

const oldTemplate = templateMatch[1];
const oldStyles = templateMatch[2];

// Extract new component body, replacing the template and styles
const newContent = currentContent.replace(
  /template:\s*`([\s\S]*?)`,\n\s*styles:\s*\[`([\s\S]*?)`\]/,
  `template: \`${oldTemplate}\`,\n  styles: [\`${oldStyles}\`]`
);

fs.writeFileSync(currentFile, newContent, 'utf8');
console.log("Successfully reverted template and styles.");
