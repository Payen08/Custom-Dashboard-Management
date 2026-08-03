#!/bin/sh
set -eu

SCRIPT_DIR=$(CDPATH= cd -- "$(dirname -- "$0")" && pwd)
GUIDELINES_DIR=$(CDPATH= cd -- "$SCRIPT_DIR/.." && pwd)
OUTPUT_DIR=$(CDPATH= cd -- "$GUIDELINES_DIR/.." && pwd)
VERSION=$(node -p "require('$GUIDELINES_DIR/package.json').version")
ARCHIVE="$OUTPUT_DIR/digital-machine-design-system-v$VERSION.tar.gz"

cd "$OUTPUT_DIR"
tar --exclude='guidelines/node_modules' --exclude='guidelines/.git' --exclude='guidelines/*.tar.gz' --exclude='guidelines/*.zip' -czf "$ARCHIVE" guidelines
echo "$ARCHIVE"
