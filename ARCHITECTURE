# ARCHITECTURE.md — OpenEV Data Dataset

## 1. Repository Architecture

### 1.1. Architectural Style: Layered Canonical Dataset (LCD)

This repository follows a **Layered Canonical Dataset (LCD)** architecture: a directory-driven, inheritance-based
data model in which **vehicle specifications are authored as layered JSON fragments** and compiled into
**canonical, fully-expanded vehicle records**.

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
````

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
* **Nulls**: not allowed as a “delete” mechanism. If a value must be removed, the schema must represent that state explicitly.
* **Unknown keys**: forbidden (schema validation fails).

### 1.5. Naming and Slugs

**Folder slugs** (`<make_slug>`, `<model_slug>`) and file slugs (`<vehicle_slug>`, `<variant_slug>`) must:

* be lowercase ASCII
* use `a-z`, `0-9`, and underscore `_` only
* not start or end with `_`
* be stable over time (renames are breaking changes)

A variant file name must match its internal `variant.slug`.

---

## 2. Canonical JSON Contract (Full Vehicle Record)

This section defines the **fully-expanded** JSON format produced by compilation and used by downstream consumers.
Source files (`base.json`, year files, variant files) may be **partial**, but the canonical output must satisfy
the contract below.

### 2.1. Global Rules

**1) Key style**

* JSON keys are `snake_case`.
* All semantic identifiers (make/model/trim/variant) use slugs in addition to human-readable names.

**2) Units (mandatory)**
All measures must be stored in **SI** or explicitly specified units below:

* Distances: `km`
* Energy: `kwh`
* Power: `kw`
* Torque: `nm`
* Speed: `kmh`
* Mass: `kg`
* Dimensions: `mm`
* Consumption: `wh_per_km`
* Temperature: `c` (Celsius)
* Pressure (tires): `kpa` (or specify unit explicitly if not `kpa`)
* Time: seconds (`s`) for performance metrics; minutes (`min`) for charge-time tables
* Dates: ISO-8601 (`YYYY-MM-DD`) for dates; ISO-8601 datetime for timestamps

**3) Numbers**

* Store numeric values as JSON numbers (not strings).
* Use `.` as decimal separator.

**4) Sources**

* Every canonical record must include at least one **verifiable** source reference in `sources`.
* If a variant changes a spec, the variant must provide a source covering that change.
* If values depend on conditions (temperature, wheel size, market), sources must reflect those conditions.

### 2.2. Identifier Policy (Canonical)

Each canonical vehicle record must have a stable identifier:

* `id`: a globally unique, stable string.
* Recommended format (normative for canonical output):

  * Base vehicle: `oed:<make_slug>:<model_slug>:<year>:<trim_slug>`
  * Variant vehicle: `oed:<make_slug>:<model_slug>:<year>:<trim_slug>:<variant_slug>`

Where:

* `trim_slug` is a stable slug for the trim/grade.
* `variant_slug` is a stable slug for the variant.

### 2.3. Canonical Schema (All Fields)

Below is the complete set of fields supported by the dataset.

> Notes:
>
> * “Required” means required in the canonical output.
> * Many optional fields exist because some manufacturers do not publish them consistently worldwide.
> * Charging-related fields are intentionally extensive to support global charging ecosystems.

#### 2.3.1. Core Identity

* `schema_version` (string, **required**) — Schema version for validation (e.g., `"1.0.0"`).
* `id` (string, **required**) — Global unique ID (see Identifier Policy).
* `make` (object, **required**)

  * `make.slug` (string, **required**) — e.g., `"bmw"`.
  * `make.name` (string, **required**) — e.g., `"BMW"`.
* `model` (object, **required**)

  * `model.slug` (string, **required**) — e.g., `"ix1"`.
  * `model.name` (string, **required**) — e.g., `"iX1"`.
* `year` (integer, **required**) — Model year for this specification set (e.g., `2024`).
* `trim` (object, **required**)

  * `trim.slug` (string, **required**) — stable trim slug (e.g., `"base"`, `"xdrive30"`).
  * `trim.name` (string, **required**) — human label (e.g., `"xDrive30"`).
* `variant` (object, optional) — present only for variants

  * `variant.slug` (string, **required if variant present**) — e.g., `"350_autonomy"`.
  * `variant.name` (string, **required if variant present**) — e.g., `"350 Autonomy"`.
  * `variant.kind` (string, optional) — e.g., `"range_upgrade"`, `"battery_upgrade"`, `"market_specific"`.
  * `variant.notes` (string, optional) — clarifying intent and scope.

#### 2.3.2. Market and Lifecycle

* `markets` (array of strings, optional) — ISO 3166-1 alpha-2 country codes (e.g., `["DE","BR"]`).
* `availability` (object, optional)

  * `availability.status` (string, **required if availability present**) — one of:

    * `production`, `discontinued`, `concept`, `prototype`
  * `availability.start_year` (integer, optional)
  * `availability.end_year` (integer, optional)

#### 2.3.3. Vehicle Classification

* `vehicle_type` (string, **required**) — one of:

  * `passenger_car`, `suv`, `pickup`, `van`, `bus`, `motorcycle`, `scooter`, `commercial`, `other`
* `body` (object, optional)

  * `body.style` (string, optional) — e.g., `crossover`, `hatchback`, `sedan`, `wagon`
  * `body.doors` (integer, optional)
  * `body.seats` (integer, optional)
  * `body.platform` (string, optional) — OEM platform code/name if published

#### 2.3.4. Powertrain

* `powertrain` (object, **required**)

  * `powertrain.drivetrain` (string, **required**) — one of: `fwd`, `rwd`, `awd`, `4wd`
  * `powertrain.motors` (array of objects, **required**, min 1)

    * `position` (string, **required**) — one of: `front`, `rear`, `other`
    * `type` (string, optional) — e.g., `pmsm`, `asm`, `sr`, `other`
    * `power_kw` (number, **required**) — motor rated power
    * `torque_nm` (number, optional)
  * `powertrain.system_power_kw` (number, optional) — combined system power
  * `powertrain.system_torque_nm` (number, optional) — combined system torque

#### 2.3.5. Battery System

* `battery` (object, **required**)

  * `battery.chemistry` (string, optional) — e.g., `lfp`, `nmc`, `nca`, `other`
  * `battery.pack_capacity_kwh_gross` (number, optional)
  * `battery.pack_capacity_kwh_net` (number, optional)
  * `battery.pack_voltage_nominal_v` (number, optional) — nominal pack voltage
  * `battery.pack_voltage_max_v` (number, optional) — max voltage at 100% SOC (if known)
  * `battery.pack_voltage_min_v` (number, optional) — min voltage at low SOC (if known)
  * `battery.cell_count` (integer, optional)
  * `battery.module_count` (integer, optional)
  * `battery.thermal_management` (string, optional) — `liquid`, `air`, `passive`, `other`
  * `battery.preconditioning` (object, optional)

    * `supported` (boolean, **required if preconditioning present**)
    * `modes` (array of strings, optional) — e.g., `["manual","route_planner","auto_on_dc"]`
    * `notes` (string, optional)
  * `battery.warranty` (object, optional)

    * `years` (integer, optional)
    * `distance_km` (integer, optional)
    * `capacity_retention_percent` (number, optional)
  * `battery.usable_soc_window_percent` (object, optional)

    * `min_percent` (number, optional)
    * `max_percent` (number, optional)
    * `notes` (string, optional)

**Rule**: at least one of `pack_capacity_kwh_gross` or `pack_capacity_kwh_net` must be present in canonical output.

#### 2.3.6. Charging (Extended Model)

Charging is modeled to support global infrastructure differences (connectors, voltages, protocols),
as well as real-world charging behavior (curves and timings).

##### 2.3.6.1. Charge Ports

* `charge_ports` (array of objects, **required**, min 1)

  * `kind` (string, **required**) — `ac_only`, `dc_only`, `combo`
    (Example: CCS is typically `combo` because AC+DC share the inlet.)
  * `connector` (string, **required**) — one of:

    * `type_1` (SAE J1772)
    * `type_2` (IEC 62196-2)
    * `ccs1` (Combo 1)
    * `ccs2` (Combo 2)
    * `chademo`
    * `gb_t_ac`
    * `gb_t_dc`
    * `nacs` (North American Charging Standard / Tesla-style inlet)
    * `tesla_type_2` (legacy Tesla EU Type 2 usage, if applicable)
    * `pantograph` (buses / opportunity charging, if applicable)
    * `mcs` (megawatt charging system, heavy-duty, if applicable)
    * `other`
  * `location` (object, optional)

    * `side` (string, optional) — `left`, `right`, `front`, `rear`, `center`
    * `position` (string, optional) — `front`, `rear`, `mid`, `unknown`
    * `notes` (string, optional)
  * `covers` (string, optional) — e.g., `flap`, `cap`, `motorized`, `none`
  * `notes` (string, optional)

##### 2.3.6.2. AC Charging

* `charging` (object, **required**)

  * `charging.ac` (object, optional)

    * `max_power_kw` (number, **required if ac present**)
    * `supported_power_steps_kw` (array of numbers, optional) — e.g., `[2.3, 3.7, 7.4, 11.0, 22.0]`
    * `phases` (integer, optional) — typically `1` or `3`
    * `voltage_range_v` (object, optional)

      * `min_v` (number, optional)
      * `max_v` (number, optional)
    * `frequency_hz` (number, optional) — e.g., `50` or `60`
    * `max_current_a` (number, optional)
    * `onboard_charger_count` (integer, optional) — if dual OBC is available
    * `notes` (string, optional)

##### 2.3.6.3. DC Fast Charging

* `charging.dc` (object, optional)

  * `max_power_kw` (number, **required if dc present**) — headline peak
  * `voltage_range_v` (object, optional)

    * `min_v` (number, optional)
    * `max_v` (number, optional)
  * `max_current_a` (number, optional)
  * `architecture_voltage_class` (string, optional) — `400v`, `800v`, `other`
  * `power_limits_by_voltage` (array of objects, optional)

    * `voltage_class` (string, **required**) — `400v`, `800v`, `other`
    * `max_power_kw` (number, **required**)
    * `notes` (string, optional)
  * `notes` (string, optional)

##### 2.3.6.4. Charging Protocols and Interoperability

* `charging.protocols` (object, optional)

  * `ac` (array of strings, optional) — e.g., `["iec_61851"]`
  * `dc` (array of strings, optional) — e.g., `["din_70121","iso_15118_2","iso_15118_20"]`
  * `plug_and_charge` (boolean, optional) — supports ISO 15118 Plug&Charge
  * `notes` (string, optional)

##### 2.3.6.5. Real Charging Behavior: DC Charge Curve (Optional but Highly Valuable)

Because peak kW is not enough to estimate charging time, this dataset supports representing
**DC charge curves** as points.

* `charging.dc_charge_curve` (object, optional)

  * `curve_type` (string, **required if curve present**) — `power_by_soc`, `current_by_soc`
  * `points` (array of objects, **required if curve present**, min 2)

    * `soc_percent` (number, **required**) — 0–100
    * `power_kw` (number, optional) — required if `curve_type=power_by_soc`
    * `current_a` (number, optional) — required if `curve_type=current_by_soc`
    * `voltage_v` (number, optional) — if known at that point
  * `conditions` (object, optional) — disclose measurement conditions

    * `battery_temp_c` (number, optional)
    * `ambient_temp_c` (number, optional)
    * `preconditioning` (boolean, optional)
    * `charger_power_kw` (number, optional) — station limit for the measurement
    * `notes` (string, optional)
  * `notes` (string, optional)

**Rule**: If a charge curve is included, it must be backed by a source describing the curve or the test.

##### 2.3.6.6. Charging Time Tables (Optional but Highly Valuable)

Charging times should always disclose:

* SOC window (`from_soc_percent`, `to_soc_percent`)

* power context (AC kW or DC station class)

* conditions (temperature, preconditioning, etc.)

* `charging_time` (object, optional)

  * `ac` (array of objects, optional)

    * `power_kw` (number, **required**)
    * `from_soc_percent` (number, **required**)
    * `to_soc_percent` (number, **required**)
    * `time_min` (number, **required**)
    * `conditions` (object, optional)

      * `ambient_temp_c` (number, optional)
      * `notes` (string, optional)
    * `notes` (string, optional)
  * `dc` (array of objects, optional)

    * `charger_power_kw` (number, **required**) — station advertised limit
    * `from_soc_percent` (number, **required**)
    * `to_soc_percent` (number, **required**)
    * `time_min` (number, **required**)
    * `conditions` (object, optional)

      * `battery_temp_c` (number, optional)
      * `ambient_temp_c` (number, optional)
      * `preconditioning` (boolean, optional)
      * `notes` (string, optional)
    * `notes` (string, optional)

##### 2.3.6.7. Bidirectional Charging (V2X)

Bidirectional support is critical for many ecosystems and varies by market, connector, and protocol.

* `v2x` (object, optional)

  * `v2l` (object, optional)

    * `supported` (boolean, **required**)
    * `max_power_kw` (number, optional)
    * `outlets` (array of objects, optional)

      * `kind` (string, **required**) — `ac`, `dc`
      * `count` (integer, optional)
      * `notes` (string, optional)
    * `notes` (string, optional)
  * `v2h` (object, optional)

    * `supported` (boolean, **required**)
    * `max_power_kw` (number, optional)
    * `connector` (string, optional) — same connector enum as charge_ports
    * `protocols` (array of strings, optional) — e.g., `["iso_15118_20","chademo"]`
    * `notes` (string, optional)
  * `v2g` (object, optional)

    * `supported` (boolean, **required**)
    * `max_power_kw` (number, optional)
    * `connector` (string, optional)
    * `protocols` (array of strings, optional)
    * `notes` (string, optional)

#### 2.3.7. Range and Efficiency

* `range` (object, **required**)

  * `range.rated` (array of objects, **required**, min 1)

    * `cycle` (string, **required**) — one of: `wltp`, `epa`, `nedc`, `cltc`, `jc08`, `other`
    * `range_km` (number, **required**)
    * `notes` (string, optional)
  * `range.real_world` (array of objects, optional)

    * `profile` (string, **required**) — e.g., `highway`, `city`, `mixed`
    * `range_km` (number, **required**)
    * `notes` (string, optional)

* `efficiency` (object, optional)

  * `energy_consumption_wh_per_km` (number, optional)
  * `mpge` (number, optional)

#### 2.3.8. Performance

* `performance` (object, optional)

  * `acceleration_0_100_kmh_s` (number, optional)
  * `top_speed_kmh` (number, optional)

#### 2.3.9. Dimensions, Weight, Capacity

* `dimensions` (object, optional)

  * `length_mm` (number, optional)
  * `width_mm` (number, optional)
  * `height_mm` (number, optional)
  * `wheelbase_mm` (number, optional)
  * `drag_coefficient_cd` (number, optional)
* `weights` (object, optional)

  * `curb_weight_kg` (number, optional)
  * `gross_vehicle_weight_kg` (number, optional)
* `capacity` (object, optional)

  * `cargo_l` (number, optional)
  * `frunk_l` (number, optional)
  * `towing_kg` (number, optional)

#### 2.3.10. Wheels and Tires (Optional, Charging-Relevant via Efficiency/Range)

Wheel/tire configuration can meaningfully affect efficiency and range.

* `wheels_tires` (object, optional)

  * `wheel_sizes_in` (array of numbers, optional) — e.g., `[18,19,20]`
  * `tire_sizes` (array of strings, optional) — e.g., `["225/55R18","245/45R19"]`
  * `recommended_pressure_kpa` (object, optional)

    * `front_kpa` (number, optional)
    * `rear_kpa` (number, optional)
  * `notes` (string, optional)

#### 2.3.11. Pricing (Optional, Market-Dependent)

* `pricing` (object, optional)

  * `msrp` (array of objects, optional)

    * `currency` (string, **required**) — ISO 4217 (e.g., `USD`, `EUR`, `BRL`)
    * `amount` (number, **required**)
    * `country` (string, optional) — ISO 3166-1 alpha-2
    * `notes` (string, optional)

#### 2.3.12. Links and References

* `links` (object, optional)

  * `manufacturer_url` (string, optional)
  * `press_kit_url` (string, optional)
  * `spec_sheet_url` (string, optional)

* `sources` (array of objects, **required**, min 1)

  * `type` (string, **required**) — e.g., `oem`, `regulatory`, `press`, `community`, `testing_org`
  * `title` (string, **required**)
  * `publisher` (string, optional)
  * `url` (string, **required**)
  * `accessed_at` (string, **required**) — ISO-8601 datetime (e.g., `"2025-12-24T00:00:00Z"`)
  * `license` (string, optional) — if known
  * `notes` (string, optional)

#### 2.3.13. Metadata

* `metadata` (object, optional)

  * `created_at` (string, optional) — ISO-8601 datetime
  * `updated_at` (string, optional) — ISO-8601 datetime
  * `contributors` (array of strings, optional) — contributor handles
  * `data_quality` (string, optional) — e.g., `verified`, `partially_verified`, `unverified`
  * `internal_notes` (string, optional) — not for consumer-facing usage

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

A variant represents a **distinct, consumer-relevant configuration** that should become a separate canonical record
(e.g., higher-range battery option, different charge port, higher DC peak, different protocol support).

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

### 3.5. When a “Variant” Must Become a New Vehicle Record

A change should be modeled as a separate canonical vehicle record when it impacts at least one of:

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

## 4. Professional Data Quality Requirements (Global Project)

* **No unverifiable claims**: every meaningful spec must be backed by at least one source.
* **Market ambiguity must be explicit**: if a spec is market-limited, specify `markets`.
* **Avoid marketing ambiguity**: prefer numeric, test-cycle-qualified values over promotional claims.
* **Prefer net capacity when available**: if both exist, store both gross and net.
* **Charging data must declare context**: charge times and curves must disclose SOC window and conditions when possible.
* **Keep variants minimal**: variants are deltas, not full copies.

---

## 5. Summary (Normative)

* Author data in layers: model base → year base → year variants.
* Compile deterministically using strict merge rules.
* Canonical output must match the full JSON contract and include sources.
* Variants must be explicit, minimal, source-backed deltas that produce separate vehicles.
* Charging is first-class: ports, AC/DC limits, protocols, curves, times, and V2X can be represented for global compatibility.
