# open-ev-data-dataset

A canonical dataset of electric vehicle specifications following a Layered Canonical Dataset (LCD) architecture.

## Overview

This repository provides a structured, versioned dataset of electric vehicle specifications. Vehicle data is authored as layered JSON fragments and compiled into canonical, fully-expanded vehicle records.

## Features

- **Layered Architecture**: Eliminates repetition through inheritance-based data model
- **Deterministic Builds**: Strict compilation rules ensure consistent output
- **Versioned Releases**: Automated versioning and changelog generation via Semantic Release
- **Conventional Commits**: Standardized commit messages for better project history

## Getting Started

### Prerequisites

- Node.js >= 18.0.0
- npm or yarn

### Installation

```bash
npm install
```

### Development

```bash
# Build the dataset
npm run build

# Validate the dataset
npm run validate
```

## Contributing

This project uses [Conventional Commits](https://www.conventionalcommits.org/) for commit messages. See [CONTRIBUTING.md](docs/CONTRIBUTING.md) for detailed guidelines.

### Commit Message Format

```
<type>(<scope>): <subject>

<body>

<footer>
```

**Types:**
- `feat`: New feature (minor version bump)
- `fix`: Bug fix (patch version bump)
- `docs`: Documentation changes
- `data`: Dataset updates
- `refactor`: Code refactoring
- And more... See [CONTRIBUTING.md](docs/CONTRIBUTING.md) for full list.

## Release Process

Releases are automated via [Semantic Release](https://semantic-release.gitbook.io/):

1. Push commits to `main` branch
2. Semantic Release analyzes commits
3. If changes warrant a release, it automatically:
   - Bumps version (following SemVer)
   - Generates changelog
   - Creates git tag
   - Publishes GitHub release

No manual version bumping needed!

## Documentation

- [Architecture Documentation](docs/ARCHITECTURE.md) - Complete architecture and schema documentation
- [Contributing Guide](docs/CONTRIBUTING.md) - How to contribute and commit message guidelines

## License

This project is licensed under the Community Data License Agreement - Permissive, Version 2.0 (CDLA-Permissive-2.0). See [LICENCE](LICENCE) for details.
