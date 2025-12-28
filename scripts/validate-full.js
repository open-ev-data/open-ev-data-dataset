#!/usr/bin/env node
/**
 * @fileoverview Full Validation Script
 * @description Runs ev-etl Docker binary for complete validation including
 * layer merging and compilation. Works on Windows, Mac, and Linux.
 * @usage npm run validate:full
 */

const { execSync } = require('child_process');
const path = require('path');

const IMAGE = 'ghcr.io/open-ev-data/ev-etl:latest';
const srcDir = path.resolve(__dirname, '../src');

/**
 * Converts a Windows path to Docker-compatible format.
 * @param {string} p - File system path.
 * @returns {string} Docker-compatible path.
 */
function toDockerPath(p) {
  if (process.platform === 'win32') {
    // C:\Users\... -> /c/Users/...
    return '/' + p.replace(/\\/g, '/').replace(/^([A-Za-z]):/, (_, letter) => letter.toLowerCase());
  }
  return p;
}

function main() {
  const dockerSrcPath = toDockerPath(srcDir);

  console.log('Running full validation with ev-etl...');
  console.log(`Source directory: ${srcDir}`);
  console.log(`Docker path: ${dockerSrcPath}\n`);

  const command = `docker run --rm -v "${dockerSrcPath}:/data" ${IMAGE} --input /data --validate-only --verbose`;

  try {
    console.log(`Pulling latest image: ${IMAGE}...`);
    execSync(`docker pull ${IMAGE}`, { stdio: 'inherit' });
    console.log('\nRunning validation tool...');
    execSync(command, { stdio: 'inherit' });
    console.log('\nValidation complete.');
    process.exit(0);
  } catch (error) {
    console.error('\nValidation failed.');
    process.exit(1);
  }
}

main();
