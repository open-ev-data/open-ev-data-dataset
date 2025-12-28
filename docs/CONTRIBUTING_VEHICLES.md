# Contributing Vehicles

This guide explains how to add new vehicles to the dataset and validate your changes.

For architecture details and merge rules, see [ARCHITECTURE.md](./ARCHITECTURE.md).
For complete field documentation, see [SCHEMA.md](./SCHEMA.md).

---

## Prerequisites

- Docker installed and running
- Node.js 22.14.0+ (for npm scripts)
- Basic understanding of JSON format

---

## Directory Structure

Vehicles are organized under `src/` following the Layered Canonical Dataset (LCD) architecture:

```text
src/
  <make_slug>/
    <model_slug>/
      base.json                           # Model-level defaults
      <year>/
        <model_slug>.json                 # Year base vehicle
        <model_slug>_<variant_slug>.json  # Variant (optional)
```

### Naming Conventions

All folder and file names (slugs) must:

- Be lowercase ASCII
- Use only `a-z`, `0-9`, and underscore `_`
- Not start or end with `_`

---

## Step 1: Create the Directory Structure

For a new manufacturer and model:

```text
src/
  tesla/                    # <make_slug>
    model_3/                # <model_slug>
      base.json
      2024/
        model_3.json
```

For an existing manufacturer with a new model, add only the model directory.

---

## Step 2: Create the Model Base File

The `base.json` file contains attributes shared across all years and trims.

**Location**: `src/<make>/<model>/base.json`

**Include**:
- `$schema` (path to schema.json)
- `schema_version`
- `make` (slug and name)
- `model` (slug and name)
- `vehicle_type`
- `body` (if consistent across years)
- `dimensions` (if consistent across years)

**Example** (`src/tesla/model_3/base.json`):

```json
{
  "$schema": "../../../schema.json",
  "schema_version": "1.0.0",
  "make": {
    "slug": "tesla",
    "name": "Tesla"
  },
  "model": {
    "slug": "model_3",
    "name": "Model 3"
  },
  "vehicle_type": "passenger_car",
  "body": {
    "style": "sedan",
    "doors": 4,
    "seats": 5
  }
}
```

---

## Step 3: Create the Year Vehicle File

The year file contains specifications for a specific model year.

**Location**: `src/<make>/<model>/<year>/<model_slug>.json`

**Required fields** (after merge with base.json):
- `schema_version`
- `make`, `model`, `year`, `trim`
- `vehicle_type`
- `powertrain` (with `drivetrain`)
- `battery` (with `pack_capacity_kwh_net` or `pack_capacity_kwh_gross`)
- `charge_ports` (at least one)
- `charging`
- `range` (at least one rated entry)
- `sources` (at least one verifiable source)

**Example** (`src/tesla/model_3/2024/model_3.json`):

```json
{
  "$schema": "../../../../schema.json",
  "schema_version": "1.0.0",
  "year": 2024,
  "trim": {
    "slug": "standard_range",
    "name": "Standard Range"
  },
  "markets": ["US", "BR", "DE", "GB", "FR", "PT", "IT", "CN", "JP"],
  "availability": {
    "status": "production",
    "start_year": 2024
  },
  "powertrain": {
    "drivetrain": "rwd",
    "system_power_kw": 208,
    "motors": [
      {
        "position": "rear",
        "type": "pmsm",
        "power_kw": 208
      }
    ]
  },
  "battery": {
    "chemistry": "lfp",
    "pack_capacity_kwh_net": 60.0,
    "thermal_management": "liquid"
  },
  "charge_ports": [
    {
      "kind": "combo",
      "connector": "nacs",
      "location": {
        "side": "left",
        "position": "rear"
      }
    }
  ],
  "charging": {
    "ac": {
      "max_power_kw": 11.0,
      "phases": 1
    },
    "dc": {
      "max_power_kw": 170,
      "architecture_voltage_class": "400v"
    }
  },
  "range": {
    "rated": [
      {
        "cycle": "wltp",
        "range_km": 513
      },
      {
        "cycle": "epa",
        "range_km": 438
      }
    ]
  },
  "sources": [
    {
      "type": "oem",
      "title": "Tesla Model 3 Official Specifications",
      "url": "https://www.tesla.com/model3",
      "accessed_at": "2024-12-28T00:00:00Z"
    }
  ]
}
```

---

## Step 4: Create Variants (Optional)

Variants are for configurations with material differences (battery size, charging capability, etc.).

**Location**: `src/<make>/<model>/<year>/<model_slug>_<variant_slug>.json`

**Rules**:
- File name must match `variant.slug`
- Include only fields that differ from the year base vehicle
- Must include its own sources for changed claims

**Example** (`src/tesla/model_3/2024/model_3_long_range.json`):

```json
{
  "$schema": "../../../../schema.json",
  "schema_version": "1.0.0",
  "variant": {
    "slug": "long_range",
    "name": "Long Range",
    "kind": "battery_upgrade"
  },
  "battery": {
    "pack_capacity_kwh_net": 82.0
  },
  "powertrain": {
    "drivetrain": "awd",
    "system_power_kw": 366
  },
  "charging": {
    "dc": {
      "max_power_kw": 250
    }
  },
  "range": {
    "rated": [
      {
        "cycle": "wltp",
        "range_km": 629
      }
    ]
  },
  "sources": [
    {
      "type": "oem",
      "title": "Tesla Model 3 Long Range Specifications",
      "url": "https://www.tesla.com/model3",
      "accessed_at": "2024-12-28T00:00:00Z"
    }
  ]
}
```

---

## Step 5: Validate Your Changes

The validation system has three levels:

### Quick Syntax Check

Validates JSON syntax only:

```bash
npm run validate
```

### Schema Validation

Validates directory structure and JSON schema (no Docker required):

```bash
npm run validate:schema
```

This validates:

**Structure Rules**:
- Each model directory must contain `base.json`
- Each year directory must contain `{model}.json`
- Variant files must be named `{model}_{variant}.json`
- No other files allowed in model directory

**Schema Rules**:
- All required fields present after merge
- No extra fields (only fields defined in schema.json allowed)
- Field values match expected types and constraints

### Full Validation

Validates everything including the Rust ETL pipeline:

```bash
npm run validate:full
```

This runs schema validation first, then the ev-etl Docker binary for complete compilation testing.

**Expected output for valid data**:

```
=== OpenEV Data Validation ===

Step 1: Validating directory structure...
Structure validation passed.

Step 2: Validating merged vehicles against schema.json...
Found 13 vehicles to validate.
All 13 vehicles passed schema validation.

=== Validation Complete ===
```

**Example error output** (missing required field):

```
SCHEMA ERRORS: 1 vehicle(s) have errors.

File: src/byd/dolphin/2024/dolphin.json
Type: year_base
Errors:
  - /: must have required property 'sources'
```

**Example error output** (invalid file name):

```
STRUCTURE ERRORS: 1 issue(s) found.

  src/byd/dolphin/2024/wrong_name.json
    Invalid file name. Variants must be named dolphin_<variant>.json
```

### IDE Real-Time Validation

VS Code, Cursor, and compatible editors show validation errors while you edit. Look for red squiggly lines under fields with issues.

---

## International Data Requirements

When adding vehicles, include sources from multiple markets:

- USA
- Brazil
- European countries (Portugal, Germany, France, Italy, United Kingdom)
- China
- Japan

Use the `markets` field to specify where the vehicle is available.

Create variants only when specifications materially differ between configurations (not for minor regional differences).

---

## Minimal Required Example

See [example/minimal_required.json](../example/minimal_required.json) for a complete minimal vehicle with only required fields.

---

## Troubleshooting

| Issue | Solution |
|-------|----------|
| `Loaded 0 vehicle files` | Check that `src/` directory contains valid JSON files |
| `MissingBatteryCapacity` | Add `pack_capacity_kwh_net` or `pack_capacity_kwh_gross` to `battery` |
| `MissingChargePort` | Add at least one entry to `charge_ports` array |
| `MissingRatedRange` | Add at least one entry to `range.rated` array |
| `MissingSource` | Add at least one entry to `sources` array |
| `InvalidSlug` | Ensure slugs are lowercase with only `a-z`, `0-9`, `_` |

---

## Further Reading

- [ARCHITECTURE.md](./ARCHITECTURE.md) — Layered data model and merge rules
- [SCHEMA.md](./SCHEMA.md) — Complete field documentation
- [RELEASE_PROCESS.md](./RELEASE_PROCESS.md) — How releases are generated
