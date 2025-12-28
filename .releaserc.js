module.exports = {
  branches: [
    'main',
    'master',
    {
      name: 'beta',
      prerelease: true
    },
    {
      name: 'alpha',
      prerelease: true
    }
  ],
  plugins: [
    [
      '@semantic-release/commit-analyzer',
      {
        preset: 'conventionalcommits',
        releaseRules: [
          { type: 'feat', release: 'minor' },
          { type: 'fix', release: 'patch' },
          { type: 'perf', release: 'patch' },
          { type: 'revert', release: 'patch' },
          { type: 'docs', release: false },
          { type: 'style', release: false },
          { type: 'chore', release: false },
          { type: 'refactor', release: 'patch' },
          { type: 'test', release: false },
          { type: 'build', release: false },
          { type: 'ci', release: false },
          { breaking: true, release: 'major' }
        ],
        parserOpts: {
          noteKeywords: ['BREAKING CHANGE', 'BREAKING CHANGES']
        }
      }
    ],
    [
      '@semantic-release/release-notes-generator',
      {
        preset: 'conventionalcommits',
        presetConfig: {
          types: [
            { type: 'feat', section: 'Features' },
            { type: 'fix', section: 'Bug Fixes' },
            { type: 'perf', section: 'Performance Improvements' },
            { type: 'revert', section: 'Reverts' },
            { type: 'docs', section: 'Documentation', hidden: false },
            { type: 'style', section: 'Styles', hidden: true },
            { type: 'chore', section: 'Miscellaneous Chores', hidden: false },
            { type: 'refactor', section: 'Code Refactoring' },
            { type: 'test', section: 'Tests', hidden: true },
            { type: 'build', section: 'Build System', hidden: false },
            { type: 'ci', section: 'CI', hidden: false },
            { type: 'data', section: 'Dataset Updates', hidden: false }
          ]
        }
      }
    ],
    [
      '@semantic-release/changelog',
      {
        changelogFile: 'CHANGELOG.md',
        changelogTitle: '# Changelog\n\nAll notable changes to this project will be documented in this file.\n\nThis project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html) and [Conventional Commits](https://www.conventionalcommits.org/).'
      }
    ],
    [
      '@semantic-release/npm',
      {
        npmPublish: false
      }
    ],
    [
      '@semantic-release/exec',
      {
        prepareCmd: 'chmod +x scripts/release/*.sh && ./scripts/release/prepare-artifacts.sh && ./scripts/release/generate-formats.sh ${nextRelease.version} && ./scripts/release/build-postgres-docker.sh ${nextRelease.version}'
      }
    ],
    [
      '@semantic-release/git',
      {
        assets: [
          'CHANGELOG.md',
          'package.json',
          'package-lock.json'
        ],
        message: 'chore(release): ${nextRelease.version} [skip ci]\n\n${nextRelease.notes}'
      }
    ],
    [
      '@semantic-release/github',
      {
        successComment: false,
        labels: false,
        releasedLabels: false,
        assets: [
          {
            path: 'dist/data/open-ev-data.json',
            label: 'OpenEV Data (JSON)',
            name: 'open-ev-data-${nextRelease.gitTag}.json'
          },
          {
            path: 'dist/data/open-ev-data.csv',
            label: 'OpenEV Data (CSV)',
            name: 'open-ev-data-${nextRelease.gitTag}.csv'
          },
          {
            path: 'dist/data/open-ev-data.sql',
            label: 'OpenEV Data (PostgreSQL)',
            name: 'open-ev-data-${nextRelease.gitTag}.sql'
          },
          {
            path: 'dist/data/open-ev-data.db',
            label: 'OpenEV Data (SQLite)',
            name: 'open-ev-data-${nextRelease.gitTag}.db'
          },
          {
            path: 'dist/data/open-ev-data.xml',
            label: 'OpenEV Data (XML)',
            name: 'open-ev-data-${nextRelease.gitTag}.xml'
          }
        ]
      }
    ]
  ]
};
