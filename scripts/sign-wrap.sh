#!/usr/bin/env bash
set -euo pipefail

WRAP_DIR="${1:?usage: sign-wrap.sh <wrap-dir>}"
cd "$WRAP_DIR"
cosign sign-blob TREE_HASH.txt --bundle SIGNATURE.sigstore.json
echo "Signed $WRAP_DIR/TREE_HASH.txt"
