# Contributing Guide

## Conventional Commits

This project uses [Conventional Commits](https://www.conventionalcommits.org/) for commit messages. This enables automatic versioning and changelog generation via [Semantic Release](https://semantic-release.gitbook.io/).

### Commit Message Format

```
<type>(<scope>): <subject>

<body>

<footer>
```

### Types

- **feat**: A new feature (triggers minor version bump)
- **fix**: A bug fix (triggers patch version bump)
- **docs**: Documentation only changes (no version bump)
- **style**: Code style changes (formatting, missing semicolons, etc.) (no version bump)
- **refactor**: Code refactoring without feature changes or bug fixes (triggers patch version bump)
- **perf**: Performance improvements (triggers patch version bump)
- **test**: Adding or updating tests (no version bump)
- **build**: Changes to build system or dependencies (no version bump)
- **ci**: Changes to CI configuration files and scripts (no version bump)
- **chore**: Other changes that don't modify src or test files (no version bump)
- **revert**: Reverts a previous commit (triggers patch version bump)
- **data**: Dataset updates (adding/updating vehicle data) (no version bump)

### Breaking Changes

To trigger a major version bump, include `BREAKING CHANGE:` in the footer or use `!` after the type/scope:

```
feat(api)!: change authentication method

BREAKING CHANGE: The authentication API has been completely rewritten.
```

Or:

```
feat!: change authentication method
```

### Examples

#### Feature
```
feat(battery): add support for LFP chemistry

Add support for Lithium Iron Phosphate (LFP) battery chemistry
in the battery specification schema.
```

#### Bug Fix
```
fix(charging): correct DC power limit calculation

The DC power limit was incorrectly calculated for 800V architecture.
This fixes the calculation to match manufacturer specifications.
```

#### Breaking Change
```
feat(schema)!: restructure powertrain object

BREAKING CHANGE: The powertrain object structure has been changed
to support multiple motor configurations. The old structure is no
longer supported.
```

#### Dataset Update
```
data(bmw): add iX1 2024 base model

Add base model specifications for BMW iX1 2024 model year.
Includes battery, charging, and range specifications.
```

### Scope (Optional)

The scope should be the area of the codebase affected:
- `schema`: Schema changes
- `build`: Build system
- `ci`: CI/CD
- `docs`: Documentation
- `data`: Dataset updates
- `validation`: Validation logic
- Or any other relevant area

### Subject

- Use imperative, present tense: "add" not "added" or "adds"
- Don't capitalize the first letter
- No dot (.) at the end
- Maximum 100 characters

### Body (Optional)

- Explain the "what" and "why" vs. "how"
- Can include multiple paragraphs
- Wrap at 200 characters

### Footer (Optional)

- Reference issues: `Closes #123`, `Fixes #456`
- Breaking changes: `BREAKING CHANGE: <description>`

## Semantic Versioning

This project follows [Semantic Versioning](https://semver.org/):
- **MAJOR** version when you make incompatible API changes
- **MINOR** version when you add functionality in a backwards compatible manner
- **PATCH** version when you make backwards compatible bug fixes

Version bumps are automatic based on commit types:
- `feat`: Minor version bump
- `fix`, `perf`, `refactor`: Patch version bump
- Breaking changes: Major version bump

## Release Process

Releases are automated via Semantic Release:
1. Push commits to `main` branch
2. Semantic Release analyzes commits
3. If changes warrant a release, it:
   - Bumps version
   - Generates changelog
   - Creates git tag
   - Publishes GitHub release

No manual version bumping needed!
