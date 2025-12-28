#!/usr/bin/env node
/**
 * @fileoverview Schema Validation Script
 * @description Validates directory structure and merged vehicles against schema.json.
 * Performs layer merging (base.json -> year -> variant) before validation.
 * @usage npm run validate:schema
 */

const fs = require('fs');
const path = require('path');
const Ajv = require('ajv');
const addFormats = require('ajv-formats');

const srcDir = path.resolve(__dirname, '../src');
const schemaPath = path.resolve(__dirname, '../schema.json');

/**
 * Loads and parses the JSON schema.
 * @returns {object} Parsed schema object.
 */
function loadSchema() {
  const content = fs.readFileSync(schemaPath, 'utf8');
  return JSON.parse(content);
}

/**
 * Deep merges two objects following LCD rules.
 * Objects are merged recursively, arrays are replaced entirely.
 * @param {object} base - Base object.
 * @param {object} override - Override object.
 * @returns {object} Merged result.
 */
function deepMerge(base, override) {
  if (typeof base !== 'object' || base === null || Array.isArray(base)) {
    return override;
  }
  if (typeof override !== 'object' || override === null || Array.isArray(override)) {
    return override;
  }

  const result = { ...base };
  for (const key of Object.keys(override)) {
    if (key in result) {
      result[key] = deepMerge(result[key], override[key]);
    } else {
      result[key] = override[key];
    }
  }
  return result;
}

/**
 * Loads and parses a JSON file.
 * @param {string} filePath - Path to JSON file.
 * @returns {object} Parsed JSON content.
 */
function loadJson(filePath) {
  const content = fs.readFileSync(filePath, 'utf8');
  return JSON.parse(content);
}

/**
 * Validates directory structure according to LCD rules.
 * @returns {object[]} Array of structure errors.
 */
function validateStructure() {
  const structureErrors = [];

  const makes = fs.readdirSync(srcDir).filter((f) => {
    const stat = fs.statSync(path.join(srcDir, f));
    return stat.isDirectory() && !f.startsWith('.');
  });

  for (const make of makes) {
    const makePath = path.join(srcDir, make);
    const models = fs.readdirSync(makePath).filter((f) => {
      const stat = fs.statSync(path.join(makePath, f));
      return stat.isDirectory() && !f.startsWith('.');
    });

    for (const model of models) {
      const modelPath = path.join(makePath, model);
      const modelContents = fs.readdirSync(modelPath);

      // Check base.json exists
      const basePath = path.join(modelPath, 'base.json');
      if (!fs.existsSync(basePath)) {
        structureErrors.push({
          path: `${make}/${model}`,
          error: 'Missing required base.json file',
        });
      }

      // Check no extra files in model directory
      const invalidFilesInModel = modelContents.filter((f) => {
        const fullPath = path.join(modelPath, f);
        const stat = fs.statSync(fullPath);
        if (stat.isDirectory()) return false;
        return f !== 'base.json';
      });

      for (const invalidFile of invalidFilesInModel) {
        structureErrors.push({
          path: `${make}/${model}/${invalidFile}`,
          error: 'Invalid file in model directory. Only base.json is allowed here.',
        });
      }

      // Check year directories
      const years = modelContents.filter((f) => {
        const stat = fs.statSync(path.join(modelPath, f));
        return stat.isDirectory() && /^\d{4}$/.test(f);
      });

      for (const year of years) {
        const yearPath = path.join(modelPath, year);
        const files = fs.readdirSync(yearPath).filter((f) => f.endsWith('.json'));

        const expectedBaseName = `${model}.json`;
        const hasYearBase = files.includes(expectedBaseName);

        if (!hasYearBase) {
          structureErrors.push({
            path: `${make}/${model}/${year}`,
            error: `Missing required year base file: ${expectedBaseName}`,
          });
        }

        // Check variant naming
        for (const file of files) {
          const baseName = file.replace('.json', '');

          if (file === expectedBaseName) {
            continue;
          }

          if (!baseName.startsWith(`${model}_`)) {
            structureErrors.push({
              path: `${make}/${model}/${year}/${file}`,
              error: `Invalid file name. Variants must be named ${model}_<variant>.json`,
            });
          }
        }
      }
    }
  }

  return structureErrors;
}

/**
 * Scans directory and returns merged vehicles.
 * @returns {object[]} Array of vehicle objects with path, type, and merged data.
 */
function scanDirectory() {
  const vehicles = [];
  const makes = fs.readdirSync(srcDir).filter((f) => {
    const stat = fs.statSync(path.join(srcDir, f));
    return stat.isDirectory() && !f.startsWith('.');
  });

  for (const make of makes) {
    const makePath = path.join(srcDir, make);
    const models = fs.readdirSync(makePath).filter((f) => {
      const stat = fs.statSync(path.join(makePath, f));
      return stat.isDirectory() && !f.startsWith('.');
    });

    for (const model of models) {
      const modelPath = path.join(makePath, model);
      const basePath = path.join(modelPath, 'base.json');

      let baseContent = {};
      if (fs.existsSync(basePath)) {
        baseContent = loadJson(basePath);
      }

      const years = fs.readdirSync(modelPath).filter((f) => {
        const stat = fs.statSync(path.join(modelPath, f));
        return stat.isDirectory() && /^\d{4}$/.test(f);
      });

      for (const year of years) {
        const yearPath = path.join(modelPath, year);
        const files = fs.readdirSync(yearPath).filter((f) => f.endsWith('.json'));

        const expectedBaseName = `${model}.json`;
        const yearBaseFile = files.find((f) => f === expectedBaseName);
        const variantFiles = files.filter((f) => f !== expectedBaseName && f.startsWith(`${model}_`));

        if (yearBaseFile) {
          const filePath = path.join(yearPath, yearBaseFile);
          const yearContent = loadJson(filePath);
          const merged = deepMerge(baseContent, yearContent);

          vehicles.push({
            path: path.relative(srcDir, filePath),
            type: 'year_base',
            data: merged,
          });

          for (const variantFile of variantFiles) {
            const variantPath = path.join(yearPath, variantFile);
            const variantContent = loadJson(variantPath);
            const mergedVariant = deepMerge(merged, variantContent);

            vehicles.push({
              path: path.relative(srcDir, variantPath),
              type: 'variant',
              data: mergedVariant,
            });
          }
        }
      }
    }
  }

  return vehicles;
}

/**
 * Formats AJV validation errors for display.
 * @param {object[]} errors - AJV error objects.
 * @returns {string} Formatted error string.
 */
function formatSchemaErrors(errors) {
  return errors
    .map((e) => {
      const field = e.instancePath || '/';
      const msg = e.message || 'unknown error';
      const params = e.params ? JSON.stringify(e.params) : '';
      return `  - ${field}: ${msg} ${params}`;
    })
    .join('\n');
}

function main() {
  console.log('=== OpenEV Data Validation ===\n');

  // Step 1: Structure validation
  console.log('Step 1: Validating directory structure...\n');
  const structureErrors = validateStructure();

  if (structureErrors.length > 0) {
    console.error(`STRUCTURE ERRORS: ${structureErrors.length} issue(s) found.\n`);
    for (const error of structureErrors) {
      console.error(`  src/${error.path}`);
      console.error(`    ${error.error}\n`);
    }
    process.exit(1);
  }

  console.log('Structure validation passed.\n');

  // Step 2: Schema validation
  console.log('Step 2: Validating merged vehicles against schema.json...\n');
  const schema = loadSchema();

  const ajv = new Ajv({ allErrors: true, strict: false });
  addFormats(ajv);

  const validate = ajv.compile(schema);
  const vehicles = scanDirectory();

  if (vehicles.length === 0) {
    console.error('ERROR: No vehicle files found in src/');
    process.exit(1);
  }

  console.log(`Found ${vehicles.length} vehicles to validate.\n`);

  const schemaErrors = [];

  for (const vehicle of vehicles) {
    const valid = validate(vehicle.data);
    if (!valid) {
      schemaErrors.push({
        path: vehicle.path,
        type: vehicle.type,
        errors: validate.errors,
      });
    }
  }

  if (schemaErrors.length === 0) {
    console.log(`All ${vehicles.length} vehicles passed schema validation.\n`);
    console.log('=== Validation Complete ===');
    process.exit(0);
  }

  console.error(`SCHEMA ERRORS: ${schemaErrors.length} vehicle(s) have errors.\n`);

  for (const error of schemaErrors) {
    console.error(`File: src/${error.path}`);
    console.error(`Type: ${error.type}`);
    console.error('Errors:');
    console.error(formatSchemaErrors(error.errors));
    console.error('');
  }

  process.exit(1);
}

main();
