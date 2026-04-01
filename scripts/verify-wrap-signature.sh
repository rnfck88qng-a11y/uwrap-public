#!/usr/bin/env bash
set -euo pipefail

WRAP_DIR="${1:?usage: verify-wrap-signature.sh <wrap-dir> <identity> <issuer>}"
IDENTITY="${2:?usage: verify-wrap-signature.sh <wrap-dir> <identity> <issuer>}"
ISSUER="${3:?usage: verify-wrap-signature.sh <wrap-dir> <identity> <issuer>}"

cd "$WRAP_DIR"
cosign verify-blob TREE_HASH.txt \
  --bundle SIGNATURE.sigstore.json \
  --certificate-identity "$IDENTITY" \
  --certificate-oidc-issuer "$ISSUER"
