#!/bin/bash
set -euo pipefail

trap 'echo "❌ ERROR on line $LINENO: Command failed with exit code $?" >&2' ERR

VERSION="${1:-dev}"

echo "📊 Generating dataset formats (version: $VERSION)..."
echo "::group::Dataset Generation"

mkdir -p dist/data

echo "🔍 Checking for ev-etl binary..."
if ! command -v ev-etl &> /dev/null; then
    echo "❌ ev-etl binary not found"
    echo "💡 Make sure ev-etl is installed in the workflow before this step"
    exit 1
fi

echo "✅ ev-etl binary found"
ev-etl --version

echo "📦 Running ev-etl to generate all formats..."
ev-etl \
    --input "$(pwd)/src" \
    --output "$(pwd)/dist/data" \
    --formats json,csv,postgresql,sqlite,xml \
    --verbose || {
    echo "❌ ev-etl failed to generate formats"
    exit 1
}

echo "✅ All formats generated successfully!"

echo "📋 Renaming output files to standard names..."
[ -f "dist/data/vehicles.json" ] && mv dist/data/vehicles.json dist/data/open-ev-data.json
[ -f "dist/data/vehicles.csv" ] && mv dist/data/vehicles.csv dist/data/open-ev-data.csv
[ -f "dist/data/vehicles.sql" ] && mv dist/data/vehicles.sql dist/data/open-ev-data.sql
[ -f "dist/data/vehicles.db" ] && mv dist/data/vehicles.db dist/data/open-ev-data.db
[ -f "dist/data/vehicles.xml" ] && mv dist/data/vehicles.xml dist/data/open-ev-data.xml

echo "📊 Verifying generated files..."
for file in dist/data/open-ev-data.*; do
  if [ -f "$file" ]; then
    echo "  ✅ $file ($(du -h "$file" | cut -f1))"
  fi
done

if [ ! -f "dist/data/open-ev-data.sql" ]; then
  echo "❌ ERROR: PostgreSQL dump was not generated!"
  exit 1
fi

echo "::endgroup::"
echo "✅ Dataset generation complete!"
ls -lh dist/data/
