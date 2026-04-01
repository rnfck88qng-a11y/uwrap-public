# Signing Spike — TREE_HASH.txt via Sigstore

## Status

Experimental. Not part of v0.1 validation.

## Purpose

Demonstrate that a uWrap can be cryptographically signed using existing Sigstore tooling, with `TREE_HASH.txt` as the single signing target.

## Why TREE_HASH.txt

`TREE_HASH.txt` is the root of the wrap's integrity chain:

```
files → hashes.txt → TREE_HASH.txt
```

If `TREE_HASH.txt` is trusted, and it equals `sha256(hashes.txt)`, and `hashes.txt` covers every file, then trust anchors the entire wrap.

One file to sign. One file to verify. Full coverage.

## Sign

```bash
cosign sign-blob TREE_HASH.txt --bundle SIGNATURE.sigstore.json --yes
```

This produces a Sigstore bundle containing the signature, certificate, and transparency log proof.

## Verify

```bash
cosign verify-blob TREE_HASH.txt \
  --bundle SIGNATURE.sigstore.json \
  --certificate-identity <signer-email-or-identity> \
  --certificate-oidc-issuer <issuer-url>
```

Common issuers:
- Google: `https://accounts.google.com`
- GitHub: `https://github.com/login/oauth`

## Trust States

| State | Meaning |
|-------|---------|
| valid | Passes 14-check validator |
| valid + unsigned | Structurally usable, no signature |
| valid + signed | Signature present in bundle |
| valid + verified identity | Signature verified against expected signer |

"Signed" and "verified" are distinct. A signature exists; verification confirms it matches an expected identity.

## Files Added

| File | Purpose |
|------|---------|
| `SIGNATURE.sigstore.json` | Sigstore bundle (optional, not validated by v0.1 validator) |

## What This Does Not Mean

- Signing is not required for v0.1 validity
- The validator does not check signatures
- This spike does not define a trust policy
- This spike does not make uWrap "trusted" — it demonstrates that trust is achievable

## Helper Scripts

```bash
# Sign
./scripts/sign-wrap.sh path/to/WRAP_001

# Verify
./scripts/verify-wrap-signature.sh path/to/WRAP_001 <identity> <issuer>
```

## Spike Result

WRAP_001 was signed on 2026-04-01 using Sigstore keyless signing via GitHub OIDC.

```
$ cosign verify-blob TREE_HASH.txt \
    --bundle SIGNATURE.sigstore.json \
    --certificate-identity "rnfck88qng@privaterelay.appleid.com" \
    --certificate-oidc-issuer "https://github.com/login/oauth"

Verified OK
```

WRAP_001 still passes all 14 validator checks. Signing is additive — it does not change the wrap's structure or hashes.

## Next Steps

- Define signing requirements for v0.2
- Add optional signature verification to validator
- Define trust policy model (which identities are trusted)
