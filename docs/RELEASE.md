# Release Process

This project uses [Semantic Release](https://semantic-release.gitbook.io/) for automated version management and releases.

## How It Works

Semantic Release analyzes your commit messages to determine:
- **What type of release** (major, minor, or patch)
- **Whether to release** at all
- **What to include** in the release notes

## Commit Types and Version Bumps

| Commit Type | Version Bump | Example |
|------------|--------------|---------|
| `feat` | Minor (1.0.0 → 1.1.0) | `feat(schema): add V2X support` |
| `fix` | Patch (1.0.0 → 1.0.1) | `fix(charging): correct DC power calculation` |
| `perf` | Patch (1.0.0 → 1.0.1) | `perf(build): optimize merge process` |
| `refactor` | Patch (1.0.0 → 1.0.1) | `refactor(validation): simplify schema checks` |
| Breaking Change | Major (1.0.0 → 2.0.0) | `feat(schema)!: restructure battery object` |
| `docs`, `style`, `chore`, `test`, `build`, `ci`, `data` | None | `docs: update architecture guide` |

## Breaking Changes

To trigger a major version bump, use one of these methods:

### Method 1: Exclamation mark in type/scope
```
feat(api)!: change authentication method
```

### Method 2: BREAKING CHANGE footer
```
feat(api): change authentication method

BREAKING CHANGE: The authentication API has been completely rewritten.
```

## Automated Release Steps

When you push to `main` (or `master`), Semantic Release:

1. **Analyzes commits** since last release
2. **Determines version** based on commit types
3. **Generates changelog** in `CHANGELOG.md`
4. **Bumps version** in `package.json`
5. **Creates git tag** (e.g., `v1.2.3`)
6. **Publishes GitHub release** with release notes
7. **Commits changes** back to repository

## Pre-release Branches

The project supports pre-release branches:

- **beta**: Pre-releases with `-beta.X` suffix (e.g., `1.2.3-beta.1`)
- **alpha**: Pre-releases with `-alpha.X` suffix (e.g., `1.2.3-alpha.1`)

## Manual Release (Local Testing)

To test the release process locally:

```bash
# Install dependencies
npm install

# Run semantic-release in dry-run mode
npx semantic-release --dry-run

# Or run the full release (will create tags and commits)
npm run semantic-release
```

**Note**: Local releases require:
- `GITHUB_TOKEN` environment variable set
- Write access to the repository
- Clean working directory

## CI/CD Integration

Releases are automatically triggered by GitHub Actions when:
- Commits are pushed to `main` or `master`
- Commits are pushed to `beta` or `alpha` branches

The workflow is defined in `.github/workflows/release.yml`.

## Troubleshooting

### Release not triggered

- Check that commits follow Conventional Commits format
- Verify commit types trigger a release (e.g., `docs` commits don't trigger releases)
- Ensure you're pushing to the correct branch (`main` or `master`)

### Wrong version bump

- Review commit messages for breaking changes
- Check `.releaserc.js` configuration
- Verify commit types match expected release rules

### Changelog not generated

- Ensure `@semantic-release/changelog` plugin is configured
- Check that `CHANGELOG.md` is in `.gitignore` (it should be committed)
- Verify file permissions

## Configuration

Release configuration is in `.releaserc.js`. Key settings:

- **Branches**: Which branches trigger releases
- **Plugins**: What actions to take during release
- **Release rules**: How commit types map to version bumps

See [Semantic Release documentation](https://semantic-release.gitbook.io/) for full configuration options.
