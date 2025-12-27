# Release Process

This document describes the automated release process for the OpenEV Data Dataset.

## Overview

The dataset release process is fully automated using semantic-release and GitHub Actions. When changes are pushed to the `main` branch, the system automatically:

1. Analyzes commit messages to determine version bump
2. Generates all dataset formats using `ev-etl`
3. Builds a PostgreSQL Docker image with pre-populated data
4. Creates a GitHub release with all artifacts
5. Publishes the Docker image to GitHub Container Registry

## Workflow Architecture

```
Push to main → CI Validation → Release Workflow → Semantic Release
                                                    ├─ Version Calculation
                                                    ├─ Changelog Generation
                                                    ├─ Artifact Generation
                                                    │  ├─ JSON
                                                    │  ├─ CSV
                                                    │  ├─ PostgreSQL
                                                    │  ├─ SQLite
                                                    │  └─ XML
                                                    ├─ Docker Image Build
                                                    ├─ Git Commit & Tag
                                                    └─ GitHub Release
```

## Release Steps

### 1. CI Validation

Before release, the CI workflow validates:
- Commit message format
- Dataset structure validation
- Build process

### 2. Version Determination

semantic-release analyzes commit messages following [Conventional Commits](https://www.conventionalcommits.org/):

- `feat:` → Minor version bump (e.g., 1.0.0 → 1.1.0)
- `fix:`, `perf:`, `refactor:` → Patch version bump (e.g., 1.0.0 → 1.0.1)
- `BREAKING CHANGE:` → Major version bump (e.g., 1.0.0 → 2.0.0)
- `docs:`, `chore:`, `style:`, `test:`, `ci:` → No release

### 3. Artifact Generation

The release scripts execute in sequence:

#### a. Prepare Artifacts
```bash
./scripts/release/prepare-artifacts.sh
```
Creates the `dist/` directory structure.

#### b. Generate Formats
```bash
./scripts/release/generate-formats.sh ${version} latest
```
Uses the `ev-etl` Docker image to transform source JSON files into:
- `open-ev-data.json` - Canonical JSON format with metadata
- `open-ev-data.csv` - Flattened tabular format
- `open-ev-data.sql` - PostgreSQL dump with DDL and data
- `open-ev-data.db` - SQLite database file
- `open-ev-data.xml` - Hierarchical XML structure

#### c. Build PostgreSQL Image
```bash
./scripts/release/build-postgres-docker.sh ${version}
```
Creates a PostgreSQL Docker image pre-populated with dataset and pushes to:
- `ghcr.io/open-ev-data/open-ev-data-postgres:${version}`
- `ghcr.io/open-ev-data/open-ev-data-postgres:latest`

### 4. Git Operations

semantic-release commits and tags:
```bash
git add CHANGELOG.md package.json package-lock.json
git commit -m "chore(release): ${version} [skip ci]"
git tag v${version}
git push origin main --tags
```

### 5. GitHub Release

Creates a GitHub release with:
- Release notes generated from commits
- All dataset format files attached
- Docker image information

## Release Assets

Each release includes:

| Asset | Format | Description |
|-------|--------|-------------|
| `open-ev-data-v*.json` | JSON | Canonical dataset with metadata |
| `open-ev-data-v*.csv` | CSV | Tabular format for spreadsheets |
| `open-ev-data-v*.sql` | SQL | PostgreSQL dump file |
| `open-ev-data-v*.db` | SQLite | SQLite database file |
| `open-ev-data-v*.xml` | XML | Hierarchical XML structure |

Plus Docker image:
- `ghcr.io/open-ev-data/open-ev-data-postgres:${version}`

## Manual Release

To manually trigger a release (requires write access):

1. Ensure all changes follow Conventional Commits
2. Push to `main` branch
3. CI validation must pass
4. Release workflow automatically triggers

## Versioning Strategy

The project follows [Semantic Versioning 2.0.0](https://semver.org/):

- **Major (X.0.0)**: Breaking changes to dataset structure or schema
- **Minor (0.X.0)**: New vehicles or data fields added
- **Patch (0.0.X)**: Bug fixes, data corrections, documentation updates

## Dependencies

The release process depends on:

- **ev-etl**: Tool from open-ev-data-api for format generation
- **Docker**: Container runtime for ev-etl and PostgreSQL image
- **Node.js**: semantic-release and related plugins
- **GitHub Actions**: CI/CD automation
- **GitHub Container Registry**: Docker image storage

## Troubleshooting

### Release not triggered

Check:
- CI workflow completed successfully
- Commit messages follow Conventional Commits format
- At least one releasable commit type present

### Artifact generation failed

Verify:
- `ev-etl` Docker image is available and accessible
- Source JSON files are valid
- Sufficient disk space in runner

### Docker push failed

Ensure:
- GitHub Container Registry authentication is configured
- Repository has `packages: write` permission
- Network connectivity to ghcr.io

## References

- [Semantic Release Documentation](https://semantic-release.gitbook.io/)
- [Conventional Commits Specification](https://www.conventionalcommits.org/)
- [GitHub Actions Documentation](https://docs.github.com/en/actions)
- [ev-etl Documentation](../../open-ev-data-api/docs/CRATE_EV_ETL.md)
