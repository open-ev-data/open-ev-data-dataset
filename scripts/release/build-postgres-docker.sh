#!/bin/bash
set -euo pipefail

trap 'echo "❌ ERROR on line $LINENO: Command failed with exit code $?" >&2' ERR

VERSION="${1:-latest}"
REGISTRY="ghcr.io"
OWNER="${GITHUB_REPOSITORY_OWNER:-open-ev-data}"

echo "🔍 Pre-flight checks..."
if [ ! -f "dist/data/open-ev-data.sql" ]; then
    echo "❌ PostgreSQL dump not found: dist/data/open-ev-data.sql"
    exit 1
fi

echo "✅ PostgreSQL dump found"
echo "🐳 Building PostgreSQL Docker image (version: $VERSION)..."
echo "::group::Docker Build - PostgreSQL"

docker build -t "$REGISTRY/$OWNER/open-ev-data-postgres:$VERSION" -f docker/Dockerfile.postgres . || {
    echo "❌ Failed to build PostgreSQL Docker image"
    exit 1
}

echo "::endgroup::"

docker tag "$REGISTRY/$OWNER/open-ev-data-postgres:$VERSION" "$REGISTRY/$OWNER/open-ev-data-postgres:latest"

echo "📤 Pushing PostgreSQL Docker image..."
echo "::group::Docker Push"

echo "Pushing open-ev-data-postgres:$VERSION..."
docker push "$REGISTRY/$OWNER/open-ev-data-postgres:$VERSION" 2>&1 || {
    echo "❌ Failed to push open-ev-data-postgres:$VERSION"
    echo "Registry: $REGISTRY"
    echo "Owner: $OWNER"
    exit 1
}

echo "Pushing open-ev-data-postgres:latest..."
docker push "$REGISTRY/$OWNER/open-ev-data-postgres:latest"

echo "::endgroup::"
echo "✅ PostgreSQL Docker image complete!"
