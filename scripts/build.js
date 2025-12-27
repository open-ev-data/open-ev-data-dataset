const fs = require('fs');
const path = require('path');

console.log('🏗️  Building dataset...');

const srcDir = path.join(__dirname, '../src');
const outputDir = path.join(__dirname, '../dist');

if (!fs.existsSync(srcDir)) {
  console.error('❌ src directory not found');
  process.exit(1);
}

fs.mkdirSync(outputDir, { recursive: true });

const vehicleFiles = [];

function collectJsonFiles(dir) {
  const items = fs.readdirSync(dir);

  for (const item of items) {
    const fullPath = path.join(dir, item);
    const stat = fs.statSync(fullPath);

    if (stat.isDirectory()) {
      collectJsonFiles(fullPath);
    } else if (item.endsWith('.json')) {
      vehicleFiles.push(fullPath);
    }
  }
}

collectJsonFiles(srcDir);

console.log(`📦 Found ${vehicleFiles.length} vehicle files`);
console.log('✅ Build complete');
console.log('💡 Use ev-etl to generate output formats');

process.exit(0);
