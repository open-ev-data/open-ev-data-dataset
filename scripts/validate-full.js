#!/usr/bin/env node
/**
 * Full validation script using ev-etl Docker image.
 * Works on Windows, Mac, and Linux.
 *
 * Usage: npm run validate:full
 */

const { execSync } = require('child_process');
const path = require('path');

const IMAGE = 'ghcr.io/open-ev-data/ev-etl:latest';
const srcDir = path.resolve(__dirname, '../src');

// Convert Windows path to Docker-compatible path
function toDockerPath(p) {
  if (process.platform === 'win32') {
    // C:\Users\... -> /c/Users/...
    return '/' + p.replace(/\\/g, '/').replace(/^([A-Za-z]):/, (_, letter) => letter.toLowerCase());
  }
  return p;
}

const dockerSrcPath = toDockerPath(srcDir);

console.log('🔍 Running full validation with ev-etl...');
console.log(`📁 Source directory: ${srcDir}`);
console.log(`🐳 Docker path: ${dockerSrcPath}`);
console.log('');

const command = `docker run --rm -v "${dockerSrcPath}:/data" ${IMAGE} --input /data --validate-only --verbose`;

try {
  execSync(command, { stdio: 'inherit' });
  console.log('');
  console.log('✅ Validation complete!');
  process.exit(0);
} catch (error) {
  console.error('');
  console.error('❌ Validation failed!');
  process.exit(1);
}
