<div align="center">
  <img src="https://raw.githubusercontent.com/open-ev-data/.github/378e7b6f98236e4b5597dee96e864373bdfc2541/assets/open-ev-data.svg" alt="OpenEV Data Logo" width="200" />
</div>

# OpenEV Data Dataset

> A canonical, open dataset of electric vehicle specifications following a Layered Canonical Dataset (LCD) architecture.

[![License: CDLA-Permissive-2.0](https://img.shields.io/badge/License-CDLA--Permissive--2.0-blue.svg)](LICENCE)
[![Version](https://img.shields.io/github/v/release/open-ev-data/open-ev-data-dataset?label=version)](https://github.com/open-ev-data/open-ev-data-dataset/releases)

## Overview

This repository provides a **structured, versioned, and community-maintained dataset** of electric vehicle specifications. Vehicle data is authored as **layered JSON fragments** and compiled into **canonical, fully-expanded vehicle records** suitable for analysis, comparison, and integration.

## Documentation

- **[Architecture](docs/ARCHITECTURE.md)** — Repository architecture, layered data model, build process, and authoring rules
- **[Schema Reference](docs/SCHEMA.md)** — Complete field-by-field documentation of the vehicle data schema
- **[Getting Started](docs/GET_STARTED.md)** — How to start the project
- **[Contributing Guide](https://github.com/open-ev-data/.github/blob/main/CONTRIBUTE.md)** — How to contribute and commit message guidelines
- **[Release Documentation](https://github.com/open-ev-data/.github/blob/main/RELEASE.md)** — Release process and semantic versioning

## Data Coverage

This dataset aims to cover:
- **Vehicle identity**: Make, model, year, trim, and variant configurations
- **Battery system**: Chemistry, capacity (gross/net), voltage, cell/module count, thermal management, warranty, preconditioning
- **Charging infrastructure**: Charge ports (Type 1, Type 2, CCS1, CCS2, NACS, CHAdeMO, GB/T), location, and features
- **Charging capabilities**: AC (power, phases, onboard charger), DC fast charging (peak power, voltage class, curves, protocols)
- **Bidirectional charging (V2X)**: V2L (Vehicle-to-Load), V2H (Vehicle-to-Home), V2G (Vehicle-to-Grid)
- **Range and efficiency**: Rated cycles (WLTP, EPA, NEDC, CLTC, JC08), real-world estimates, energy consumption
- **Powertrain**: Motor configuration, power, torque, drivetrain, transmission
- **Performance**: Acceleration (0-100 km/h, 0-60 mph), top speed, quarter mile
- **Physical specifications**: Dimensions, weight, cargo capacity, towing capacity
- **Wheels and tires**: Sizes, recommended pressures
- **Market data**: Availability status, markets (by country), pricing (MSRP)
- **Software**: Operating system, OTA update support
- **Sources and metadata**: Verifiable sources, data quality indicators, contributors

## Use Cases

- **Research**: EV market analysis, charging infrastructure planning
- **Applications**: EV comparison tools, range calculators, charging time estimators
- **APIs**: Backend data source for automotive applications
- **Education**: Learning about EV technology and specifications

## License

This project is licensed under the **Community Data License Agreement - Permissive, Version 2.0 (CDLA-Permissive-2.0)**.

In summary:
- Free to use, modify, and share
- No restrictions on results or derivatives
- No warranty provided

See [LICENCE](LICENCE) for full terms.

## Acknowledgments

This project is inspired by the need for open, structured, and verifiable EV data. Special thanks to all contributors who help maintain and improve this dataset.
