#!/bin/bash
set -euo pipefail

trap 'echo "❌ ERROR on line $LINENO: Command failed with exit code $?" >&2' ERR

VERSION="${1:-dev}"
REGISTRY="${DOCKER_REGISTRY:-ghcr.io}"
OWNER="${GITHUB_REPOSITORY_OWNER:-open-ev-data}"
ETL_VERSION="${2:-latest}"

echo "📊 Generating dataset formats (version: $VERSION)..."
echo "::group::Dataset Generation"

mkdir -p dist/data

echo "🔐 Verifying Docker authentication..."
docker info 2>&1 | grep -i "username" || echo "⚠️  No docker authentication detected, continuing anyway..."

echo "🔍 Pulling ev-etl Docker image..."
echo "    Registry: $REGISTRY"
echo "    Owner: $OWNER"
echo "    Image: $REGISTRY/$OWNER/ev-etl:$ETL_VERSION"

docker pull "$REGISTRY/$OWNER/ev-etl:$ETL_VERSION" || {
    echo "❌ Failed to pull ev-etl:$ETL_VERSION"
    echo "💡 Make sure the ev-etl package visibility is set to public or authentication is configured"
    exit 1
}

echo "✅ ev-etl image pulled successfully"

echo "📦 Running ev-etl to generate all formats..."
docker run --rm \
    -v "$(pwd)/src:/input:ro" \
    -v "$(pwd)/dist/data:/output" \
    "$REGISTRY/$OWNER/ev-etl:$ETL_VERSION" \
    --input /input \
    --output /output \
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

echo "::endgroup::"
echo "✅ Dataset generation complete!"
ls -lh dist/data/
