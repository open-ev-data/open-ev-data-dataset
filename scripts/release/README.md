# Release Scripts

Automation scripts for building and releasing OpenEV Data dataset artifacts.

## Overview

These scripts generate multiple dataset formats using the `ev-etl` binary from the API repository and publish them as release assets along with a PostgreSQL Docker image.

## Scripts

### `prepare-artifacts.sh`

Prepares the `dist/` directory structure for release artifacts.

### `generate-formats.sh`

Uses `ev-etl` binary to generate all dataset formats:
- JSON (canonical format)
- CSV (tabular format)
- PostgreSQL (SQL dump)
- SQLite (database file)
- XML (hierarchical format)

**Usage:**
```bash
./scripts/release/generate-formats.sh <version>
```

**Example:**
```bash
./scripts/release/generate-formats.sh 1.2.0
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
3. Latest `ev-etl` binary is downloaded from API releases
4. semantic-release determines the next version
5. `prepareCmd` executes all release scripts in sequence
6. Generated artifacts are attached to the GitHub release
7. PostgreSQL Docker image is pushed to GHCR

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

- `ev-etl` binary (automatically downloaded from API releases in CI/CD)
- Bash
- Docker (for PostgreSQL image building)
- Access to GitHub Container Registry (for CI/CD)

## Local Testing

To test the release process locally:

```bash
# Download ev-etl binary
LATEST_RELEASE=$(curl -s https://api.github.com/repos/open-ev-data/open-ev-data-api/releases/latest | jq -r .tag_name)
curl -L -o ev-etl.tar.gz \
  "https://github.com/open-ev-data/open-ev-data-api/releases/download/$LATEST_RELEASE/ev-etl-x86_64-unknown-linux-gnu.tar.gz"
tar -xzf ev-etl.tar.gz
chmod +x ev-etl
sudo mv ev-etl /usr/local/bin/

# Run release scripts
export GITHUB_REPOSITORY_OWNER=open-ev-data

chmod +x scripts/release/*.sh

./scripts/release/prepare-artifacts.sh
./scripts/release/generate-formats.sh dev
./scripts/release/build-postgres-docker.sh dev
```
