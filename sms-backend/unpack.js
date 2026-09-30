const fs = require('fs');
const path = require('path');

const mergedFile = path.join(__dirname, 'merged_code.js');
const content = fs.readFileSync(mergedFile, 'utf8');

const parts = content.split('// === FILE: ');

for (let i = 1; i < parts.length; i++) {
  const part = parts[i];
  const endOfLine = part.indexOf(' ===');
  const filePath = part.substring(0, endOfLine).trim();
  const fileContent = part.substring(part.indexOf('\n') + 1);

  const fullPath = path.join(__dirname, filePath);
  const dir = path.dirname(fullPath);

  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }

  fs.writeFileSync(fullPath, fileContent.trim() + '\n', 'utf8');
  console.log(`Created: ${filePath}`);
}

console.log('Unpacking complete!');
