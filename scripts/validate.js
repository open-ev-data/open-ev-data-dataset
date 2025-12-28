#!/usr/bin/env node
/**
 * @fileoverview JSON Syntax Validator
 * @description Validates that all JSON files in src/ have valid syntax.
 * This is a quick check that does not validate against schema.
 * @usage npm run validate
 */

const fs = require('fs');
const path = require('path');

const srcDir = path.join(__dirname, '../src');

/**
 * Validates JSON syntax for a single file.
 * @param {string} filePath - Absolute path to the JSON file.
 * @returns {boolean} True if valid, false otherwise.
 */
function validateJsonFile(filePath) {
  try {
    const content = fs.readFileSync(filePath, 'utf8');
    JSON.parse(content);
    return true;
  } catch (error) {
    console.error(`Invalid JSON: ${filePath}`);
    console.error(`  ${error.message}`);
    return false;
  }
}

/**
 * Recursively validates all JSON files in a directory.
 * @param {string} dir - Directory path to scan.
 * @returns {boolean} True if all files are valid.
 */
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

function main() {
  console.log('Validating JSON syntax...\n');

  if (!fs.existsSync(srcDir)) {
    console.error('ERROR: src directory not found');
    process.exit(1);
  }

  const isValid = validateDirectory(srcDir);

  if (isValid) {
    console.log('All JSON files have valid syntax.');
    process.exit(0);
  } else {
    console.error('\nValidation failed.');
    process.exit(1);
  }
}

main();
