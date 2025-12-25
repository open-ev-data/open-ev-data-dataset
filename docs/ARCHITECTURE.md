# ARCHITECTURE — OpenEV Data Dataset

## 1. Repository Architecture

### 1.1. Architectural Style: Layered Canonical Dataset (LCD)

This repository follows a **Layered Canonical Dataset (LCD)** architecture: a directory-driven, inheritance-based data model in which **vehicle specifications are authored as layered JSON fragments** and compiled into **canonical, fully-expanded vehicle records**.

**Why LCD**
- **Eliminates repetition**: shared attributes live in `base.json` and are inherited by year and variant files.
- **Deterministic builds**: compilation follows a strict precedence order, producing the same output for the same input.
- **Low-friction contributions**: contributors edit small, localized JSON files instead of a monolithic dataset.
- **Supports variants cleanly**: a single base vehicle can generate multiple canonical vehicles (e.g., a higher-range variant).
- **Global correctness**: a strict contract (schema + units + validation rules) enforces consistency across markets.

### 1.2. Repository Layout (Source of Truth)

The dataset is authored under `src/` with this logical structure:

```text
src/
  <make_slug>/
    <model_slug>/
      base.json
      <year>/
        <vehicle_slug>.json
        <vehicle_slug>_<variant_slug>.json
        <vehicle_slug>_<variant_slug>.json
        ...
```

**Example**

```text
src/
  bmw/
    ix1/
      base.json
      2024/
        ix1.json
        ix1_350_autonomy.json
      2025/
        ...
```

### 1.3. Build/Compilation Model (Canonicalization)

The build process produces **canonical vehicle records** by applying a merge pipeline:

**Merge Precedence (lowest → highest)**

1. `src/<make>/<model>/base.json` (model-level defaults)
2. `src/<make>/<model>/<year>/<vehicle_slug>.json` (year base vehicle)
3. `src/<make>/<model>/<year>/<vehicle_slug>_<variant_slug>.json` (variant override, optional)

**Output cardinality**

* Each `<vehicle_slug>.json` produces **one** canonical vehicle (the year base).
* Each matching `<vehicle_slug>_<variant_slug>.json` produces **one additional** canonical vehicle.

### 1.4. Merge Rules (Deterministic)

To guarantee predictable compilation:

* **Objects**: deep-merged by key.
* **Scalars (string/number/bool)**: overridden by the higher-precedence layer.
* **Arrays**: replaced entirely by the higher-precedence layer (no implicit concatenation).
* **Nulls**: not allowed as a "delete" mechanism. If a value must be removed, the schema must represent that state explicitly.
* **Unknown keys**: forbidden (schema validation fails).

### 1.5. Naming and Slugs

**Folder slugs** (`<make_slug>`, `<model_slug>`) and file slugs (`<vehicle_slug>`, `<variant_slug>`) must:

* be lowercase ASCII
* use `a-z`, `0-9`, and underscore `_` only
* not start or end with `_`
* be stable over time (renames are breaking changes)

A variant file name must match its internal `variant.slug`.

---

## 2. Canonical Vehicle Record Contract

This section defines the contract for **fully-expanded** JSON vehicle records produced by compilation.

For complete documentation of all fields, data types, and validation rules, see **[SCHEMA.md](./SCHEMA.md)**.

### 2.1. Global Rules

**Key style**
* JSON keys are `snake_case`.
* All semantic identifiers (make/model/trim/variant) use slugs in addition to human-readable names.

**Units**
All measures must be stored in **SI** or explicitly specified units. See [SCHEMA.md](./SCHEMA.md) for the complete units convention.

**Numbers**
* Store numeric values as JSON numbers (not strings).
* Use `.` as decimal separator.

**Sources**
* Every canonical record must include at least one **verifiable** source reference in `sources`.
* If a variant changes a spec, the variant must provide a source covering that change.
* If values depend on conditions (temperature, wheel size, market), sources must reflect those conditions.

### 2.2. Identifier Policy (Canonical)

Each canonical vehicle record must have a stable identifier:

* `unique_code`: an optional internal unique code or database key.
* Recommended format for external usage (normative for canonical output):

  * Base vehicle: `oed:<make_slug>:<model_slug>:<year>:<trim_slug>`
  * Variant vehicle: `oed:<make_slug>:<model_slug>:<year>:<trim_slug>:<variant_slug>`

Where:

* `trim_slug` is a stable slug for the trim/grade.
* `variant_slug` is a stable slug for the variant.

### 2.3. Required Fields (Root Level)

The following fields are **required** at the root level of every canonical vehicle record:

* `schema_version`: "1.0.0"
* `make`: object with `slug` and `name`
* `model`: object with `slug` and `name`
* `year`: integer (model year)
* `trim`: object with `slug` and `name`
* `vehicle_type`: classification string
* `powertrain`: object with `drivetrain` (and optionally motors, power, etc.)
* `battery`: object (must include at least one of `pack_capacity_kwh_gross` or `pack_capacity_kwh_net`)
* `charge_ports`: array with at least one port
* `charging`: object (should include `ac` and/or `dc` specifications)
* `range`: object with `rated` array (at least one rated range entry)
* `sources`: array with at least one verifiable source

For detailed specifications of all fields (required and optional), see **[SCHEMA.md](./SCHEMA.md)**.

---

## 3. Authoring Rules: Base, Year, and Variant Layers

This repository is authored in layers, but compiled into canonical full records.

### 3.1. Model Base (`src/<make>/<model>/base.json`)

**Purpose**

* Store attributes that are stable across years and trims (or that rarely change), minimizing duplication.

**Allowed content (recommended)**

* `make`, `model`
* `vehicle_type`, `body` (if stable)
* `dimensions` (if stable)
* charge-port connector defaults (only if stable)
* high-level links and references

**Not recommended in model base**

* `year`
* `range`, `pricing`, `availability` (usually year/market specific)
* `performance` figures (often change)
* charge curve / charge times (often change by year, firmware, battery supplier, market)
* anything that is demonstrably year-dependent

### 3.2. Year Base Vehicle (`src/<make>/<model>/<year>/<vehicle_slug>.json`)

**Purpose**

* Defines the canonical base vehicle for a given year (and typically a trim/grade).

**Rules**

* Must include: `year`, `trim`, `battery`, `charge_ports`, `charging`, `range`, and `sources`.
* Must compile into a valid canonical vehicle record after merging with model base.
* File name `<vehicle_slug>.json` is the **variant root** for that year.

### 3.3. Variant Vehicle (`src/<make>/<model>/<year>/<vehicle_slug>_<variant_slug>.json`)

A variant represents a **distinct, consumer-relevant configuration** that should become a separate canonical record (e.g., higher-range battery option, different charge port, higher DC peak, different protocol support).

**Mandatory rules**

1. The filename must be:

   * `<vehicle_slug>_<variant_slug>.json`
2. The JSON must include:

   * `variant.slug == "<variant_slug>"`
   * `variant.name` (human label)
3. The file must be a **delta**:

   * Include only fields that differ from the year base vehicle (plus `variant` and any required sources).
4. The variant must include **sources covering the changed claims**.

**Variant intent (recommended)**

* Provide `variant.kind` to classify the nature of the change, such as:

  * `range_upgrade`, `battery_upgrade`, `charging_upgrade`, `market_specific`, `software_unlock`, `wheel_package`, `v2x_enabled`

### 3.4. Variant Examples (Pattern)

#### 3.4.1. Year base vehicle (`ix1.json`) — minimal illustration

```json
{
  "schema_version": "1.0.0",
  "year": 2024,
  "trim": { "slug": "base", "name": "Base" },
  "charge_ports": [
    {
      "kind": "combo",
      "connector": "ccs2",
      "location": { "side": "right", "position": "rear" }
    }
  ],
  "powertrain": {
    "drivetrain": "awd",
    "motors": [
      { "position": "front", "power_kw": 100 },
      { "position": "rear", "power_kw": 140 }
    ],
    "system_power_kw": 230
  },
  "battery": { "pack_capacity_kwh_net": 64.7, "thermal_management": "liquid" },
  "charging": {
    "ac": { "max_power_kw": 11.0, "phases": 3 },
    "dc": { "max_power_kw": 130.0, "architecture_voltage_class": "400v" },
    "protocols": { "dc": ["din_70121", "iso_15118_2"], "plug_and_charge": true }
  },
  "range": {
    "rated": [{ "cycle": "wltp", "range_km": 438 }]
  },
  "sources": [
    {
      "type": "oem",
      "title": "Official Specifications",
      "url": "https://example.com/specs",
      "accessed_at": "2025-12-24T00:00:00Z"
    }
  ]
}
```

#### 3.4.2. Variant (`ix1_350_autonomy.json`) — delta illustration

```json
{
  "schema_version": "1.0.0",
  "variant": {
    "slug": "350_autonomy",
    "name": "350 Autonomy",
    "kind": "range_upgrade",
    "notes": "Higher autonomy configuration for this model year."
  },
  "range": {
    "rated": [{ "cycle": "wltp", "range_km": 350 }]
  },
  "sources": [
    {
      "type": "oem",
      "title": "Variant Range Statement",
      "url": "https://example.com/variant-range",
      "accessed_at": "2025-12-24T00:00:00Z"
    }
  ]
}
```

**Compilation outcome**

* Produces:

  1. Base canonical vehicle (from `ix1.json`)
  2. Variant canonical vehicle (merged `base.json` + `ix1.json` + `ix1_350_autonomy.json`)

### 3.5. When a "Variant" Must Become a New Vehicle Record

A change should be modeled as a separate canonical vehicle record (variant) when it impacts at least one of:

* range rating (any test cycle)
* battery capacity (gross/net), voltage class, or usable SOC window
* drivetrain or motor configuration
* charging capability (AC/DC power limits, connector, voltage/current limits)
* charging protocols / Plug&Charge support (interoperability changes)
* DC charge curve or charge-time table (material changes)
* V2X capability (V2L/V2H/V2G support, max power, protocol/connector)
* official performance metrics (0–100, top speed)
* regulatory classification impacting consumer comparison

Minor changes that do not affect key specs (e.g., infotainment-only changes) should be stored as notes and not as variants.

---

## 4. Professional Data Quality Requirements

* **No unverifiable claims**: every meaningful spec must be backed by at least one source.
* **Market ambiguity must be explicit**: if a spec is market-limited, specify `markets`.
* **Avoid marketing ambiguity**: prefer numeric, test-cycle-qualified values over promotional claims.
* **Prefer net capacity when available**: if both exist, store both gross and net.
* **Charging data must declare context**: charge times and curves must disclose SOC window and conditions when possible.
* **Keep variants minimal**: variants are deltas, not full copies.

---

## 5. Build and Validation Process

### 5.1. Compilation Pipeline (Future)

The repository will provide tooling to:

1. **Discover** all vehicle files in `src/`
2. **Merge** layers according to precedence rules
3. **Validate** against `schema.json`
4. **Generate** canonical output files
5. **Export** to various formats (JSON, CSV, SQL, etc.)

### 5.2. Validation

All canonical vehicle records must:

* Pass JSON Schema validation against `schema.json`
* Have at least one source
* Have at least one rated range entry
* Have at least one charge port
* Have battery capacity (gross or net)
* Follow naming conventions for slugs

---

## 6. Summary (Normative)

* **Author data in layers**: model base → year base → year variants.
* **Compile deterministically** using strict merge rules (objects merge, scalars override, arrays replace).
* **Canonical output** must match the full JSON contract defined in `schema.json` and documented in [SCHEMA.md](./SCHEMA.md).
* **Variants** must be explicit, minimal, source-backed deltas that produce separate vehicles.
* **Charging is first-class**: ports, AC/DC limits, protocols, curves, times, and V2X can be represented for global compatibility.
* **Data quality is paramount**: every spec must be verifiable, market-specific data must be explicit, and ambiguity must be minimized.

---

For complete field-by-field documentation of the schema, see **[SCHEMA.md](./SCHEMA.md)**.
