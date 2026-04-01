# uWrap v0.1 Specification

## A folder-based format for packaging AI work with deterministic validation

---

## Abstract

uWrap is a directory format that packages AI work outputs with structured metadata, evidence, and integrity hashing.

A valid uWrap passes 14 deterministic validation checks enforced by a reference validator.

---

## 1. Overview

A uWrap is a folder. It contains:

- **What the wrap describes** (manifest metadata)
- **What result was recorded** (result + evidence)
- **What state transitions were logged** (history log)
- **Proof of internal file integrity** (hash chain)

```
WRAP_001/
  manifest.json
  RESULT.json
  evidence/
  history.log
  hashes.txt
  TREE_HASH.txt
```

---

## 2. Required Files

Every valid uWrap MUST contain:

| File | Purpose |
|------|---------|
| `manifest.json` | Metadata envelope |
| `RESULT.json` | Structured outcome |
| `evidence/` | Supporting artifacts |
| `history.log` | Append-only state log |
| `hashes.txt` | SHA-256 hash of each file |
| `TREE_HASH.txt` | SHA-256 of hashes.txt |

---

## 3. manifest.json

### Required Fields

| Field | Constraint |
|-------|-----------|
| `wrap_id` | `/^WRAP_[0-9]{3,}$/` |
| `version` | semantic version |
| `title` | non-empty string |
| `claim_id` | `/^CLAIM_[0-9]{3,}$/` |
| `challenge_id` | `/^CHAL_[0-9]{3,}$/` |
| `lifecycle_state` | enum |
| `source` | non-empty string |
| `run_id` | non-empty string |

### Optional Fields

- `claim_summary`
- `created`
- `modified`

### Lifecycle States

```
DRAFT → PROPOSED → TESTABLE → VERIFIED → CANONICAL → DEPRECATED
```

---

## 4. RESULT.json

Must be valid JSON and include:

```json
{
  "status": "..."
}
```

---

## 5. evidence/

- MUST exist
- MUST contain >= 1 file
- Files MUST appear in hashes.txt

The evidence directory makes a wrap inspectable rather than purely declarative.

v0.1 does not enforce evidence sufficiency.

---

## 6. history.log

Append-only:

```
<timestamp> | <STATE> | <description>
```

No deletion or mutation.

---

## 7. Integrity Chain

### hashes.txt

- SHA-256 per file
- All files listed (except hashes.txt and TREE_HASH.txt)
- Sorted alphabetically
- No phantom entries

### TREE_HASH.txt

```
sha256(hashes.txt)
```

Single root hash.

---

## 8. Validation

A valid uWrap passes 14 checks:

### Structural (7)

- Required files exist
- evidence/ non-empty

### Schema (2)

- manifest.json parseable
- Required fields valid

### Integrity (3)

- Hashes match files
- TREE_HASH valid
- Full coverage

### Semantic (2)

- RESULT.json parseable
- `status` field present

### Important

Passing validation means:

- Structure is complete
- Schema is valid
- Integrity is preserved

It does **NOT** prove:

- The claim is true
- The evidence is sufficient
- The wrap is trusted or signed

### Reference Validator

```bash
node ci/validate_wrap.mjs <wrap-dir>
node ci/validate_wrap.mjs --json <wrap-dir>
```

**If this document conflicts with the validator, the validator is authoritative.**

---

## 9. Example

WRAP_001 is a real wrap derived from an internal proof cycle.

---

## 10. What uWrap Is Not

uWrap v0.1 does NOT provide:

- Runtime governance enforcement
- Cryptographic signing
- Transport
- Concurrency control
- Economic model
- Trust certification

---

## 11. Comparable Standards

| Standard | Relation |
|----------|----------|
| SLSA | Supply chain provenance (different scope) |
| SARIF | Structured results |
| JUnit | Test output |
| OCI | Artifact packaging |

uWrap operates at the work-unit evidence level.

---

## 12. Versioning

This is v0.1.0.

Compatibility rules:

- Required files will not be removed without major version bump
- Required fields will not be removed or renamed without major version bump
- Integrity chain will not change without major version bump
- Optional fields may be added in minor/patch versions
- New required fields require major version bump

---

## 13. License

Apache-2.0
