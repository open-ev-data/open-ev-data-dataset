# Release Scripts

Automation scripts for building and releasing OpenEV Data dataset artifacts.

## Overview

These scripts generate multiple dataset formats using the `ev-etl` tool from the API repository and publish them as release assets along with a PostgreSQL Docker image.

## Scripts

### `prepare-artifacts.sh`

Prepares the `dist/` directory structure for release artifacts.

### `generate-formats.sh`

Uses `ev-etl` Docker image to generate all dataset formats:
- JSON (canonical format)
- CSV (tabular format)
- PostgreSQL (SQL dump)
- SQLite (database file)
- XML (hierarchical format)

**Usage:**
```bash
./scripts/release/generate-formats.sh <version> [etl-version]
```

**Example:**
```bash
./scripts/release/generate-formats.sh 1.2.0 latest
```

### `build-postgres-docker.sh`

Builds and pushes a PostgreSQL Docker image pre-populated with dataset.

**Usage:**
```bash
./scripts/release/build-postgres-docker.sh <version>
```

**Example:**
```bash
./scripts/release/build-postgres-docker.sh 1.2.0
```

## CI/CD Integration

These scripts are automatically executed by semantic-release during the release process:

1. CI workflow validates the dataset
2. Release workflow triggers after successful CI
3. semantic-release determines the next version
4. `prepareCmd` executes all release scripts in sequence
5. Generated artifacts are attached to the GitHub release
6. PostgreSQL Docker image is pushed to GHCR

## Docker Images

### PostgreSQL Database

Pre-populated PostgreSQL database with the complete dataset:

```bash
docker pull ghcr.io/open-ev-data/open-ev-data-postgres:latest
docker run -d -p 5432:5432 ghcr.io/open-ev-data/open-ev-data-postgres:latest
```

Default credentials:
- User: `openevdata`
- Password: `openevdata`
- Database: `openevdata`

## Requirements

- Docker (for ev-etl and PostgreSQL image building)
- Bash
- Access to GitHub Container Registry (for CI/CD)

## Local Testing

To test the release process locally:

```bash
export GITHUB_REPOSITORY_OWNER=open-ev-data

chmod +x scripts/release/*.sh

./scripts/release/prepare-artifacts.sh
./scripts/release/generate-formats.sh dev latest
./scripts/release/build-postgres-docker.sh dev
```
