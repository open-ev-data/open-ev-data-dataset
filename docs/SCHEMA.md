# SCHEMA — OpenEV Data Dataset Schema Documentation

This document provides a complete reference for all fields defined in the `schema.json` file. For information about the repository architecture, layered data model, and build process, see [ARCHITECTURE.md](./ARCHITECTURE.md).

## Schema Version

Current schema version: **1.0.0**

## Units Convention

All measurements in this schema follow these unit conventions:

- **Distances**: km (kilometers)
- **Energy**: kwh (kilowatt-hours)
- **Power**: kw (kilowatts)
- **Torque**: nm (Newton-meters)
- **Speed**: kmh (kilometers per hour)
- **Mass**: kg (kilograms)
- **Dimensions**: mm (millimeters)
- **Consumption**: wh_per_km (watt-hours per kilometer)
- **Temperature**: c (Celsius)
- **Pressure**: kpa (kilopascals)
- **Time**: s (seconds) for performance metrics, min (minutes) for charging times
- **Current**: a (amperes)
- **Voltage**: v (volts)
- **Dates**: ISO-8601 format (YYYY-MM-DD for dates, full datetime with timezone for timestamps)

---

## Root Level Fields

### `$schema`
- **Type**: string
- **Required**: No
- **Description**: Path or URL to the schema file itself. Used for validation in IDEs and tools.

### `schema_version`
- **Type**: string
- **Required**: Yes
- **Constant**: "1.0.0"
- **Description**: The version of the schema that this vehicle record conforms to. Must always be "1.0.0" for current schema.

### `unique_code`
- **Type**: string
- **Required**: No
- **Description**: Internal unique code or database key. Optional field that can be used for internal tracking or database references.

---

## Vehicle Identity

### `make`
- **Type**: object (slug_name)
- **Required**: Yes
- **Description**: The vehicle manufacturer or brand.
- **Properties**:
  - `slug` (string, required): Lowercase identifier (e.g., "bmw", "tesla", "volkswagen")
  - `name` (string, required): Human-readable name (e.g., "BMW", "Tesla", "Volkswagen")

### `model`
- **Type**: object (slug_name)
- **Required**: Yes
- **Description**: The vehicle model name.
- **Properties**:
  - `slug` (string, required): Lowercase identifier (e.g., "model_3", "id4", "leaf")
  - `name` (string, required): Human-readable name (e.g., "Model 3", "ID.4", "Leaf")

### `year`
- **Type**: integer
- **Required**: Yes
- **Range**: 1900 to 2100
- **Description**: The model year of the vehicle. This is the year the vehicle is marketed as, not necessarily the production year.

### `trim`
- **Type**: object (slug_name)
- **Required**: Yes
- **Description**: The trim level or grade of the vehicle.
- **Properties**:
  - `slug` (string, required): Lowercase identifier (e.g., "base", "premium", "long_range")
  - `name` (string, required): Human-readable name (e.g., "Base", "Premium", "Long Range")

### `variant`
- **Type**: object
- **Required**: No
- **Description**: Used only for variant vehicles that differ from the base configuration in meaningful ways. See [ARCHITECTURE.md](./ARCHITECTURE.md) for variant rules.
- **Properties**:
  - `slug` (string, required if variant present): Lowercase identifier for the variant
  - `name` (string, required if variant present): Human-readable variant name
  - `kind` (string, optional): Classification of the variant type (e.g., "range_upgrade", "performance_package", "battery_upgrade", "market_specific")
  - `notes` (string, optional): Additional context about the variant

---

## Market and Availability

### `markets`
- **Type**: array of strings
- **Required**: No
- **Description**: ISO 3166-1 alpha-2 country codes indicating where this vehicle is or was available.
- **Pattern**: Two uppercase letters (e.g., "US", "DE", "BR", "CN", "JP")
- **Example**: `["US", "CA", "MX"]`

### `availability`
- **Type**: object
- **Required**: No
- **Description**: Information about the vehicle's production and availability status.
- **Properties**:
  - `status` (string, required if availability present): Current status of the vehicle
    - Allowed values: "production", "discontinued", "concept", "announced", "prototype"
  - `start_year` (integer, optional): Year production or availability began
  - `end_year` (integer, optional): Year production or availability ended
  - `notes` (string, optional): Additional context about availability

---

## Vehicle Classification

### `vehicle_type`
- **Type**: string
- **Required**: Yes
- **Description**: Primary classification of the vehicle type.
- **Allowed values**:
  - `passenger_car`: Standard passenger vehicle
  - `suv`: Sport Utility Vehicle
  - `pickup`: Pickup truck
  - `van`: Van or minivan
  - `bus`: Bus or coach
  - `motorcycle`: Motorcycle
  - `scooter`: Electric scooter or moped
  - `commercial`: Commercial vehicle
  - `truck`: Truck
  - `other`: Other vehicle types

### `body`
- **Type**: object
- **Required**: No
- **Description**: Physical body characteristics of the vehicle.
- **Properties**:
  - `style` (string, optional): Body style (e.g., "sedan", "hatchback", "crossover", "coupe", "wagon", "convertible")
  - `doors` (integer, optional): Number of doors
  - `seats` (integer, optional): Number of seats
  - `rows` (integer, optional): Number of seating rows
  - `platform` (string, optional): OEM platform code or name if published
  - `drag_coefficient_cd` (number, optional): Aerodynamic drag coefficient

---

## Physical Specifications

### `dimensions`
- **Type**: object
- **Required**: No
- **Description**: Physical dimensions of the vehicle in millimeters.
- **Properties**:
  - `length_mm` (number, optional): Overall length
  - `width_mm` (number, optional): Width without mirrors
  - `width_with_mirrors_mm` (number, optional): Width including mirrors
  - `height_mm` (number, optional): Overall height
  - `wheelbase_mm` (number, optional): Distance between front and rear axles
  - `ground_clearance_mm` (number, optional): Minimum ground clearance
  - `turning_circle_m` (number, optional): Turning circle diameter in meters

### `weights`
- **Type**: object
- **Required**: No
- **Description**: Weight specifications in kilograms.
- **Properties**:
  - `curb_weight_kg` (number, optional): Weight of the vehicle without passengers or cargo
  - `gross_vehicle_weight_kg` (number, optional): Maximum permissible total weight
  - `max_payload_kg` (number, optional): Maximum payload capacity
  - `roof_load_kg` (number, optional): Maximum roof load capacity

### `capacity`
- **Type**: object
- **Required**: No
- **Description**: Cargo and towing capacities.
- **Properties**:
  - `cargo_l` (number, optional): Cargo volume in liters (seats up)
  - `cargo_max_l` (number, optional): Maximum cargo volume in liters (seats folded)
  - `frunk_l` (number, optional): Front trunk (frunk) volume in liters
  - `towing_braked_kg` (number, optional): Maximum towing capacity with braked trailer
  - `towing_unbraked_kg` (number, optional): Maximum towing capacity with unbraked trailer
  - `towing_vertical_load_kg` (number, optional): Maximum vertical load on tow hitch

---

## Powertrain

### `powertrain`
- **Type**: object
- **Required**: Yes
- **Description**: Electric powertrain configuration and specifications.
- **Properties**:
  - `drivetrain` (string, required): Drive configuration
    - Allowed values: "fwd" (front-wheel drive), "rwd" (rear-wheel drive), "awd" (all-wheel drive), "4wd" (four-wheel drive)
  - `system_power_kw` (number, optional): Combined system power output in kilowatts
  - `system_torque_nm` (number, optional): Combined system torque in Newton-meters
  - `motors` (array, optional): Array of electric motor specifications
    - `position` (string, required): Motor location - "front", "rear", or "other"
    - `type` (string, optional): Motor type (e.g., "pmsm", "asm", "brushless", "induction")
    - `power_kw` (number, optional): Individual motor power output
    - `torque_nm` (number, optional): Individual motor torque
    - `cooling` (string, optional): Motor cooling method
  - `transmission` (object, optional): Transmission information
    - `gears` (integer, optional): Number of gears
    - `type` (string, optional): Transmission type

---

## Battery System

### `battery`
- **Type**: object
- **Required**: Yes
- **Description**: Battery pack specifications and characteristics.
- **Properties**:
  - `manufacturer` (string, optional): Battery manufacturer (e.g., "CATL", "LG Energy Solution", "Panasonic")
  - `chemistry` (string, optional): Battery chemistry (e.g., "li-ion", "lfp", "nmc", "nca", "solid_state")
  - `cathode_material` (string, optional): Specific cathode material designation
  - `pack_capacity_kwh_gross` (number, optional): Total battery capacity including buffer
  - `pack_capacity_kwh_net` (number, optional): Usable battery capacity
  - `pack_voltage_nominal_v` (number, optional): Nominal pack voltage
  - `pack_voltage_max_v` (number, optional): Maximum pack voltage at full charge
  - `pack_voltage_min_v` (number, optional): Minimum pack voltage at low state of charge
  - `cell_count` (integer, optional): Total number of battery cells
  - `module_count` (integer, optional): Number of battery modules
  - `thermal_management` (string, optional): Battery cooling/heating system
    - Allowed values: "liquid", "air", "passive", "refrigerant", "none"
  - `heat_pump` (boolean, optional): Whether vehicle has a heat pump for cabin/battery thermal management
  - `preconditioning` (object, optional): Battery preconditioning capabilities
    - `supported` (boolean, required if preconditioning present): Whether preconditioning is available
    - `modes` (array of strings, optional): Available preconditioning modes (e.g., "manual", "route_planner", "auto_on_dc")
    - `notes` (string, optional): Additional preconditioning details
  - `warranty` (object, optional): Battery warranty information
    - `years` (integer, optional): Warranty duration in years
    - `distance_km` (integer, optional): Warranty distance limit
    - `capacity_retention_percent` (number, optional): Guaranteed capacity retention percentage
  - `usable_soc_window_percent` (object, optional): Usable state of charge window
    - `min_percent` (number, optional): Minimum usable SOC percentage
    - `max_percent` (number, optional): Maximum usable SOC percentage
    - `notes` (string, optional): Additional context about SOC window

---

## Charging Infrastructure

### `charge_ports`
- **Type**: array
- **Required**: Yes
- **Description**: Physical charging port(s) on the vehicle.
- **Items** (each charge port):
  - `kind` (string, required): Port type
    - `ac_only`: AC charging only
    - `dc_only`: DC fast charging only
    - `combo`: Combined AC and DC in one inlet (e.g., CCS)
  - `connector` (string, required): Connector standard
    - Allowed values: "type_1" (SAE J1772), "type_2" (IEC 62196-2), "ccs1" (CCS Combo 1), "ccs2" (CCS Combo 2), "nacs" (North American Charging Standard / Tesla), "chademo", "gb_t_ac", "gb_t_dc", "tesla_type_2", "other"
  - `location` (object, optional): Physical location of the port
    - `side` (string, optional): Side of vehicle - "left", "right", "front", "rear", "center"
    - `position` (string, optional): Position along side - "front", "rear", "mid"
    - `notes` (string, optional): Additional location details
  - `covers` (string, optional): Type of port cover (e.g., "flap", "cap", "motorized", "none")
  - `light` (boolean, optional): Whether port has illumination
  - `motorized` (boolean, optional): Whether port door is motorized
  - `notes` (string, optional): Additional port information

### `charging`
- **Type**: object
- **Required**: Yes
- **Description**: Charging capabilities and specifications.

#### `charging.ac`
- **Type**: object
- **Required**: No
- **Description**: AC (Level 2) charging specifications.
- **Properties**:
  - `max_power_kw` (number, required if ac present): Maximum AC charging power
  - `supported_power_steps_kw` (array of numbers, optional): Supported charging power levels (e.g., [2.3, 3.7, 7.4, 11.0, 22.0])
  - `phases` (integer, optional): Number of phases (1, 2, or 3)
  - `voltage_range_v` (object, optional): Accepted voltage range
    - `min_v` (number, optional): Minimum voltage
    - `max_v` (number, optional): Maximum voltage
  - `frequency_hz` (number, optional): AC frequency (50 or 60 Hz)
  - `max_current_a` (number, optional): Maximum current draw in amperes
  - `onboard_charger_count` (integer, optional): Number of onboard chargers (relevant for dual-charger setups)
  - `notes` (string, optional): Additional AC charging information

#### `charging.dc`
- **Type**: object
- **Required**: No
- **Description**: DC fast charging specifications.
- **Properties**:
  - `max_power_kw` (number, required if dc present): Peak DC charging power
  - `voltage_range_v` (object, optional): Accepted voltage range
    - `min_v` (number, optional): Minimum voltage
    - `max_v` (number, optional): Maximum voltage
  - `max_current_a` (number, optional): Maximum current acceptance
  - `architecture_voltage_class` (string, optional): Battery architecture voltage class
    - Allowed values: "400v", "800v", "other"
  - `power_limits_by_voltage` (array, optional): Different power limits based on charger voltage
    - `voltage_class` (string, required): Voltage class identifier
    - `max_power_kw` (number, required): Maximum power for this voltage class
    - `notes` (string, optional): Additional context
  - `notes` (string, optional): Additional DC charging information

#### `charging.protocols`
- **Type**: object
- **Required**: No
- **Description**: Supported charging communication protocols.
- **Properties**:
  - `ac` (array of strings, optional): AC charging protocols (e.g., ["iec_61851"])
  - `dc` (array of strings, optional): DC charging protocols (e.g., ["din_70121", "iso_15118_2", "iso_15118_20", "chademo"])
  - `plug_and_charge` (boolean, optional): Whether ISO 15118 Plug & Charge is supported
  - `notes` (string, optional): Additional protocol information

#### `charging.dc_charge_curve`
- **Type**: object
- **Required**: No
- **Description**: DC fast charging power curve over state of charge. Critical for understanding real-world charging performance.
- **Properties**:
  - `curve_type` (string, required if curve present): Type of curve data
    - Allowed values: "power_by_soc" (power at different SOC levels), "current_by_soc" (current at different SOC levels)
  - `points` (array, required if curve present): Array of curve data points
    - `soc_percent` (number, required): State of charge percentage (0-100)
    - `power_kw` (number, optional): Charging power at this SOC
    - `current_a` (number, optional): Charging current at this SOC
    - `voltage_v` (number, optional): Battery voltage at this SOC
  - `conditions` (object, optional): Test conditions for this curve (see conditions definition below)
  - `source_url` (string, optional): URL to the source of this curve data
  - `notes` (string, optional): Additional curve information

#### `charging.charging_time`
- **Type**: object
- **Required**: No
- **Description**: Measured or estimated charging times for different scenarios.

##### `charging.charging_time.ac`
- **Type**: array
- **Required**: No
- **Description**: AC charging time measurements.
- **Items**:
  - `power_kw` (number, required): AC charging power used
  - `from_soc_percent` (number, required): Starting state of charge
  - `to_soc_percent` (number, required): Ending state of charge
  - `time_min` (number, required): Time required in minutes
  - `conditions` (object, optional): Test conditions
  - `notes` (string, optional): Additional context

##### `charging.charging_time.dc`
- **Type**: array
- **Required**: No
- **Description**: DC fast charging time measurements.
- **Items**:
  - `charger_power_kw` (number, required): Charger station power rating
  - `from_soc_percent` (number, required): Starting state of charge
  - `to_soc_percent` (number, required): Ending state of charge
  - `time_min` (number, required): Time required in minutes
  - `conditions` (object, optional): Test conditions
  - `notes` (string, optional): Additional context

---

## Bidirectional Charging (V2X)

### `v2x`
- **Type**: object
- **Required**: No
- **Description**: Vehicle-to-everything (V2X) bidirectional charging capabilities.

#### `v2x.v2l`
- **Type**: object
- **Required**: No
- **Description**: Vehicle-to-Load (powering external devices).
- **Properties**:
  - `supported` (boolean, required if v2l present): Whether V2L is supported
  - `max_power_kw` (number, optional): Maximum V2L power output
  - `outlets` (array, optional): Available power outlets
    - `kind` (string, required): Outlet type (e.g., "socket_type_f", "socket_type_g", "usb_c", "ac_outlet")
    - `count` (integer, optional): Number of outlets of this type
    - `location` (string, optional): Location of outlets
    - `notes` (string, optional): Additional outlet information
  - `notes` (string, optional): Additional V2L information

#### `v2x.v2h`
- **Type**: object
- **Required**: No
- **Description**: Vehicle-to-Home (powering a home).
- **Properties**:
  - `supported` (boolean, required if v2h present): Whether V2H is supported
  - `max_power_kw` (number, optional): Maximum V2H power output
  - `connector` (string, optional): Connector used for V2H
  - `protocols` (array of strings, optional): Supported V2H protocols (e.g., ["iso_15118_20", "chademo"])
  - `notes` (string, optional): Additional V2H information

#### `v2x.v2g`
- **Type**: object
- **Required**: No
- **Description**: Vehicle-to-Grid (feeding power back to the electrical grid).
- **Properties**:
  - `supported` (boolean, required if v2g present): Whether V2G is supported
  - `max_power_kw` (number, optional): Maximum V2G power output
  - `connector` (string, optional): Connector used for V2G
  - `protocols` (array of strings, optional): Supported V2G protocols
  - `notes` (string, optional): Additional V2G information

---

## Range and Efficiency

### `range`
- **Type**: object
- **Required**: Yes
- **Description**: Vehicle range under various testing cycles and real-world conditions.

#### `range.rated`
- **Type**: array
- **Required**: Yes
- **Description**: Official regulatory test cycle range ratings.
- **Items**:
  - `cycle` (string, required): Test cycle used
    - Allowed values: "wltp" (Worldwide Harmonized Light-duty Test Procedure), "epa" (US EPA), "nedc" (New European Driving Cycle), "cltc" (China Light-duty Test Cycle), "jc08" (Japanese cycle), "other"
  - `range_km` (number, required): Rated range in kilometers
  - `notes` (string, optional): Additional context about the rating

#### `range.real_world`
- **Type**: array
- **Required**: No
- **Description**: Real-world range measurements or estimates.
- **Items**:
  - `profile` (string, required): Driving profile
    - Allowed values: "highway", "city", "mixed", "cold_weather", "winter", "summer"
  - `range_km` (number, required): Observed or estimated range
  - `conditions` (object, optional): Test conditions
    - `weather` (string, optional): Weather description
    - `speed_kmh` (number, optional): Average or constant speed
  - `notes` (string, optional): Additional context

### `efficiency`
- **Type**: object
- **Required**: No
- **Description**: Energy efficiency metrics.
- **Properties**:
  - `energy_consumption_wh_per_km` (number, optional): Energy consumption in watt-hours per kilometer
  - `mpge` (number, optional): Miles per gallon equivalent (US EPA metric)
  - `notes` (string, optional): Additional efficiency information

---

## Performance

### `performance`
- **Type**: object
- **Required**: No
- **Description**: Vehicle performance specifications.
- **Properties**:
  - `acceleration_0_100_kmh_s` (number, optional): 0-100 km/h acceleration time in seconds
  - `acceleration_0_60_mph_s` (number, optional): 0-60 mph acceleration time in seconds
  - `top_speed_kmh` (number, optional): Maximum speed in km/h
  - `quarter_mile_s` (number, optional): Quarter mile time in seconds

---

## Wheels and Tires

### `wheels_tires`
- **Type**: object
- **Required**: No
- **Description**: Wheel and tire specifications. Can affect range and efficiency.
- **Properties**:
  - `standard_wheel_size_in` (number, optional): Standard wheel diameter in inches
  - `optional_wheel_sizes_in` (array of numbers, optional): Available optional wheel sizes
  - `tire_sizes` (array of strings, optional): Tire size designations (e.g., ["225/55R18", "245/45R19"])
  - `recommended_pressure_kpa` (object, optional): Recommended tire pressures
    - `front_kpa` (number, optional): Front tire pressure in kilopascals
    - `rear_kpa` (number, optional): Rear tire pressure in kilopascals
  - `notes` (string, optional): Additional wheel/tire information

---

## Pricing

### `pricing`
- **Type**: object
- **Required**: No
- **Description**: Pricing information for different markets and years.

#### `pricing.msrp`
- **Type**: array
- **Required**: No
- **Description**: Manufacturer's Suggested Retail Price entries.
- **Items**:
  - `currency` (string, required): ISO 4217 currency code (exactly 3 characters, e.g., "USD", "EUR", "BRL")
  - `amount` (number, required): Price amount
  - `country` (string, optional): Country where this price applies (ISO 3166-1 alpha-2)
  - `year` (integer, optional): Year this pricing is for
  - `notes` (string, optional): Additional pricing context (e.g., "before incentives", "with destination charge")

---

## Software and Technology

### `software`
- **Type**: object
- **Required**: No
- **Description**: Software and infotainment information.
- **Properties**:
  - `os` (string, optional): Operating system or software platform name
  - `ota_supported` (boolean, optional): Whether over-the-air software updates are supported
  - `notes` (string, optional): Additional software information

---

## Links and Media

### `links`
- **Type**: object
- **Required**: No
- **Description**: Reference URLs for official resources.
- **Properties**:
  - `manufacturer_url` (string, optional): Official manufacturer product page URL
  - `press_kit_url` (string, optional): Press kit or media resources URL
  - `spec_sheet_url` (string, optional): Official specification sheet URL
  - `configurator_url` (string, optional): Online configurator URL

### `images`
- **Type**: object
- **Required**: No
- **Description**: URLs to images and visual resources.
- **Properties**:
  - `exterior_url` (string, optional): Exterior photo URL
  - `interior_url` (string, optional): Interior photo URL
  - `charging_curve_plot_url` (string, optional): Charging curve visualization URL

---

## Sources and Metadata

### `sources`
- **Type**: array
- **Required**: Yes
- **Description**: Verifiable sources for the data in this record. Every vehicle record must have at least one source.
- **Items**:
  - `type` (string, required): Source type
    - Allowed values: "oem" (official manufacturer), "regulatory" (government/regulatory body), "press" (press release/article), "community" (community testing/reporting), "testing_org" (independent testing organization)
  - `title` (string, required): Source title or name
  - `publisher` (string, optional): Publishing organization
  - `url` (string, required): URL to the source (must be valid URI)
  - `accessed_at` (string, required): When the source was accessed (ISO-8601 datetime format)
  - `license` (string, optional): License of the source material if known
  - `notes` (string, optional): Additional source context

### `metadata`
- **Type**: object
- **Required**: No
- **Description**: Internal metadata about this vehicle record.
- **Properties**:
  - `created_at` (string, optional): When this record was created (ISO-8601 datetime)
  - `updated_at` (string, optional): When this record was last updated (ISO-8601 datetime)
  - `contributors` (array of strings, optional): Contributors to this record
  - `data_quality` (string, optional): Quality assessment (e.g., "verified", "partially_verified", "unverified")
  - `internal_notes` (string, optional): Internal notes not meant for public consumption

---

## Reusable Definitions

These definitions are referenced throughout the schema using `$ref`.

### `slug_name`
A common pattern for identifiers that need both machine-readable slugs and human-readable names.
- **Properties**:
  - `slug` (string, required): Lowercase identifier matching pattern `^[a-z0-9_]+$`
  - `name` (string, required): Human-readable name

### `min_max_v`
Voltage range specification.
- **Properties**:
  - `min_v` (number, optional): Minimum voltage
  - `max_v` (number, optional): Maximum voltage

### `conditions`
Test or measurement conditions that can be referenced by charging curves and charging time measurements.
- **Properties**:
  - `battery_temp_c` (number, optional): Battery temperature in Celsius
  - `ambient_temp_c` (number, optional): Ambient temperature in Celsius
  - `preconditioning` (boolean, optional): Whether battery was preconditioned
  - `charger_power_kw` (number, optional): Charger station power rating
  - `notes` (string, optional): Additional condition details

---

## Validation Rules

Beyond the field definitions above, the following validation rules apply:

1. **At least one battery capacity** must be present: either `battery.pack_capacity_kwh_gross` or `battery.pack_capacity_kwh_net` (or both)
2. **Charge ports array** must have at least one item
3. **Range rated array** must have at least one item
4. **Sources array** must have at least one item
5. **Year** must be between 1900 and 2100
6. **ISO country codes** in `markets` must be exactly 2 uppercase letters
7. **ISO currency codes** in `pricing.msrp` must be exactly 3 characters
8. **SOC percentages** must be between 0 and 100
9. **If variant object is present**, both `variant.slug` and `variant.name` are required
10. **If charging curve is present**, must have at least 2 points

---

## Best Practices

### Required Fields Strategy
The schema marks relatively few fields as required at the root level to accommodate:
- Vehicles with incomplete public data
- Incremental data collection
- Market-specific variations

However, for a **high-quality, complete vehicle record**, contributors should aim to provide:
- Complete battery specifications (both gross and net capacity)
- Both AC and DC charging specifications when applicable
- At least one rated range value
- Performance metrics if publicly available
- Multiple verifiable sources

### Data Quality
- Always provide sources for any non-trivial specification
- When data varies by market, use the `markets` field to be explicit
- Use `notes` fields to clarify ambiguities or special cases
- Prefer official OEM sources over secondary sources when available

### Variant Usage
See [ARCHITECTURE.md](./ARCHITECTURE.md) for detailed guidance on when to create variants versus new base vehicles.

---

For information about how to author vehicle data files, the layered data model, compilation process, and directory structure, see [ARCHITECTURE.md](./ARCHITECTURE.md).
