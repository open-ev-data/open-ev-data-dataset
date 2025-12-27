const fs = require('fs');
const path = require('path');

console.log('🔍 Validating dataset...');

const srcDir = path.join(__dirname, '../src');

function validateJsonFile(filePath) {
  try {
    const content = fs.readFileSync(filePath, 'utf8');
    JSON.parse(content);
    return true;
  } catch (error) {
    console.error(`❌ Invalid JSON in ${filePath}: ${error.message}`);
    return false;
  }
}

function validateDirectory(dir) {
  let valid = true;
  const items = fs.readdirSync(dir);

  for (const item of items) {
    const fullPath = path.join(dir, item);
    const stat = fs.statSync(fullPath);

    if (stat.isDirectory()) {
      if (!validateDirectory(fullPath)) {
        valid = false;
      }
    } else if (item.endsWith('.json')) {
      if (!validateJsonFile(fullPath)) {
        valid = false;
      }
    }
  }

  return valid;
}

if (!fs.existsSync(srcDir)) {
  console.error('❌ src directory not found');
  process.exit(1);
}

const isValid = validateDirectory(srcDir);

if (isValid) {
  console.log('✅ All JSON files are valid');
  process.exit(0);
} else {
  console.error('❌ Validation failed');
  process.exit(1);
}
