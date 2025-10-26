#!/usr/bin/env bash
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REPO_ROOT="$(cd "${SCRIPT_DIR}/.." && pwd)"
OUTPUT_ZIP="${REPO_ROOT}/cmd/image-compare-desktop/app.zip"

mkdir -p "$(dirname "${OUTPUT_ZIP}")"
cd "${REPO_ROOT}"

if command -v zip >/dev/null 2>&1; then
  zip -qr "${OUTPUT_ZIP}" app
else
  echo "Error: the 'zip' utility is required to create ${OUTPUT_ZIP}" >&2
  exit 1
fi
