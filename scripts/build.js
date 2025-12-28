#!/usr/bin/env node
/**
 * @fileoverview Dataset Build Script
 * @description Collects all vehicle JSON files from src/ directory.
 * The actual compilation and merging is done by ev-etl (Rust).
 * @usage npm run build
 */

const fs = require('fs');
const path = require('path');

const srcDir = path.join(__dirname, '../src');
const outputDir = path.join(__dirname, '../dist');

/**
 * Recursively collects all JSON files from a directory.
 * @param {string} dir - Directory path to scan.
 * @param {string[]} files - Array to accumulate file paths.
 */
function collectJsonFiles(dir, files = []) {
  const items = fs.readdirSync(dir);

  for (const item of items) {
    const fullPath = path.join(dir, item);
    const stat = fs.statSync(fullPath);

    if (stat.isDirectory()) {
      collectJsonFiles(fullPath, files);
    } else if (item.endsWith('.json')) {
      files.push(fullPath);
    }
  }

  return files;
}

function main() {
  console.log('Building dataset...\n');

  if (!fs.existsSync(srcDir)) {
    console.error('ERROR: src directory not found');
    process.exit(1);
  }

  fs.mkdirSync(outputDir, { recursive: true });

  const vehicleFiles = collectJsonFiles(srcDir);

  console.log(`Found ${vehicleFiles.length} vehicle files.`);
  console.log('Build complete.');
  console.log('Use ev-etl to generate output formats.');

  process.exit(0);
}

main();
