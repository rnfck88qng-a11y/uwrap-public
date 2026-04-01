# uWrap v0.1 Specification
## A folder-based format for verifiable AI work units

---

## Abstract

uWrap is a directory format that packages AI work outputs with structured metadata, evidence, and tamper-evident integrity hashing. A valid uWrap passes 14 deterministic validation checks. The format is enforced by a zero-dependency validator.

---

## 1. Overview

A uWrap is a folder. It contains:

- **What was claimed** (manifest metadata)
- **What was measured** (result + evidence)
- **What happened** (history log)
- **Proof it hasn't been tampered with** (hash chain)

```
WRAP_001/
  manifest.json         Metadata envelope
  RESULT.json           Structured outcome
  evidence/             Supporting artifacts
    *.json              Input data, measurements, comparisons
  history.log           State transition log
  hashes.txt            SHA-256 per file
  TREE_HASH.txt         Root integrity hash
```

---

## 2. Required Files

Every valid uWrap MUST contain:

| File | Type | Purpose |
|------|------|---------|
| `manifest.json` | JSON | Metadata: what this wrap is, what claim it relates to, lifecycle state |
| `RESULT.json` | JSON | Structured outcome with at minimum a `status` field |
| `evidence/` | Directory | One or more files providing supporting evidence |
| `history.log` | Text | Append-only log of state transitions |
| `hashes.txt` | Text | SHA-256 hash of every file (except itself and TREE_HASH.txt) |
| `TREE_HASH.txt` | Text | SHA-256 of the contents of hashes.txt |

---

## 3. manifest.json

The metadata envelope for the wrap.

### Required Fields

| Field | Type | Constraint | Description |
|-------|------|-----------|-------------|
| `wrap_id` | string | `/^WRAP_[0-9]{3,}$/` | Unique identifier |
| `version` | string | `/^[0-9]+\.[0-9]+\.[0-9]+$/` | Format version (currently `0.1.0`) |
| `title` | string | Non-empty | Human-readable description |
| `claim_id` | string | `/^CLAIM_[0-9]{3,}$/` | Claim this wrap provides evidence for |
| `challenge_id` | string | `/^CHAL_[0-9]{3,}$/` | Challenge that produced this wrap |
| `lifecycle_state` | string | Enum (see below) | Current promotion state |
| `source` | string | Non-empty | System that produced the wrap |
| `run_id` | string | Non-empty | Identifier for the execution run |

### Optional Fields

| Field | Type | Description |
|-------|------|-------------|
| `claim_summary` | string | Human-readable claim statement |
| `created` | date-time | ISO 8601 creation timestamp |
| `modified` | date-time | ISO 8601 last modification timestamp |

### Lifecycle States

```
DRAFT → PROPOSED → TESTABLE → VERIFIED → CANONICAL → DEPRECATED
```

| State | Meaning |
|-------|---------|
| DRAFT | Initial creation, not yet submitted |
| PROPOSED | Submitted for evaluation |
| TESTABLE | Evidence attached, ready for verification |
| VERIFIED | Passed all required checks |
| CANONICAL | Accepted as authoritative |
| DEPRECATED | Superseded or invalidated |

Promotion is forward-only except DEPRECATED, which may be applied to any CANONICAL wrap.

### No tree_hash in manifest

`tree_hash` does NOT appear in manifest.json. It lives exclusively in `TREE_HASH.txt`. This avoids a circular dependency where the manifest hash (part of hashes.txt) would depend on tree_hash, which depends on hashes.txt.

---

## 4. RESULT.json

Structured outcome of the work unit. Contents are domain-specific, but MUST include:

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `status` | string | Yes | Outcome: PASS, FAIL, or domain-specific |

All other fields are domain-defined. The validator checks for valid JSON and the presence of `status`.

---

## 5. evidence/

A directory containing one or more files that support the result. These are the raw inputs, measurements, and comparisons that the result was derived from.

Requirements:
- Directory MUST exist
- Directory MUST contain at least one file
- Files SHOULD be JSON for machine-readability
- Files MUST be listed in hashes.txt

The evidence directory is what makes a uWrap verifiable rather than anecdotal. Anyone can re-derive the result from the evidence.

---

## 6. history.log

Append-only text log recording state transitions. Each line:

```
<ISO-8601-timestamp> | <STATE> | <description>
```

Example:
```
2026-04-01T16:26:05.128Z | DRAFT | wrap created from challenge CHAL_001
2026-04-01T16:26:05.128Z | PROPOSED | run completed with status PASS
```

No deletions. No mutations. Append only.

---

## 7. Integrity Chain

### hashes.txt

Contains one line per file in the wrap (excluding `hashes.txt` itself and `TREE_HASH.txt`):

```
<sha256-hex>  <relative-path>
```

Example:
```
40ab589bbfa614c9...  RESULT.json
56744179e221f950...  evidence/baseline_results.json
a6c01be31f587a11...  evidence/challenge_event.json
1d416ebf3739f534...  evidence/patched_results.json
a3b11c70e62854ab...  history.log
63d9a4517b78c6ba...  manifest.json
```

Rules:
- Paths are relative to the wrap root
- Sorted alphabetically
- Two-space separator between hash and path
- Every file in the wrap (except hashes.txt and TREE_HASH.txt) MUST appear
- No phantom entries (every listed file must exist)

### TREE_HASH.txt

Contains a single SHA-256 hash: the hash of the entire contents of `hashes.txt`.

```
TREE_HASH.txt = sha256(readFile("hashes.txt"))
```

This is the single root hash for the entire wrap. Verifying TREE_HASH.txt and then verifying hashes.txt proves the integrity of every file.

---

## 8. Validation

A valid uWrap passes all 14 checks:

### Layer 1: Structural (7 checks)
1. `manifest.json` exists
2. `RESULT.json` exists
3. `history.log` exists
4. `hashes.txt` exists
5. `TREE_HASH.txt` exists
6. `evidence/` directory exists
7. `evidence/` contains at least one file

### Layer 2: Schema (2 checks)
8. `manifest.json` is valid JSON
9. All required manifest fields present and valid per schema

### Layer 3: Integrity (3 checks)
10. Every hash in `hashes.txt` matches the actual file content
11. `TREE_HASH.txt` matches `sha256(hashes.txt)`
12. Every file is in `hashes.txt` and every `hashes.txt` entry has a file

### Layer 4: Semantic (2 checks)
13. `RESULT.json` is valid JSON
14. `RESULT.json` contains a `status` field

### Reference Validator

The reference validator is `ci/validate_wrap.mjs`. Zero external dependencies. Node.js built-ins only.

```bash
# Human-readable output
node ci/validate_wrap.mjs path/to/WRAP_001

# Machine-readable JSON output for CI
node ci/validate_wrap.mjs --json path/to/WRAP_001
```

Exit codes:
- `0` — all checks pass
- `1` — one or more checks failed
- `2` — usage error

**If there is ambiguity between this document and the validator, the validator is authoritative.**

---

## 9. Example

WRAP_001 — a real loop-derived wrap from the first governed proof cycle:

**Claim:** "Patch X improves validation reliability over baseline."

**manifest.json:**
```json
{
  "wrap_id": "WRAP_001",
  "version": "0.1.0",
  "title": "Challenge result: Patch X improves validation reliability over baseline.",
  "claim_id": "CLAIM_001",
  "claim_summary": "Patch X improves validation reliability over baseline.",
  "challenge_id": "CHAL_001",
  "lifecycle_state": "PROPOSED",
  "created": "2026-04-01T16:26:05.128Z",
  "modified": "2026-04-01T16:26:05.128Z",
  "source": "uLab",
  "run_id": "RUN_CHAL_001"
}
```

**RESULT.json** (abbreviated):
```json
{
  "run_id": "RUN_CHAL_001",
  "status": "PASS",
  "comparison": {
    "baseline_pass_rate": 0.85,
    "patched_pass_rate": 0.95,
    "improvement": 0.10,
    "threshold": 0.95,
    "threshold_met": true
  }
}
```

**Validation:**
```
$ node ci/validate_wrap.mjs examples/WRAP_001

  [PASS] required_file:manifest.json — present
  [PASS] required_file:RESULT.json — present
  [PASS] required_file:history.log — present
  [PASS] required_file:hashes.txt — present
  [PASS] required_file:TREE_HASH.txt — present
  [PASS] required_dir:evidence — present
  [PASS] evidence_not_empty — 3 file(s)
  [PASS] manifest_parse — valid JSON
  [PASS] manifest_schema — all fields valid
  [PASS] hash_files_all — 6 files verified
  [PASS] tree_hash — verified
  [PASS] hash_coverage — all files accounted for
  [PASS] result_parse — valid JSON
  [PASS] result_has_status — status: PASS

  RESULT: ALL 14 CHECKS PASSED
```

---

## 10. What uWrap Is Not

uWrap v0.1 does NOT provide:

- **Runtime governance enforcement.** The format can be validated; it cannot prevent unvalidated work from being used.
- **Cryptographic signing.** Integrity is hash-based, not signature-based. Non-repudiation requires additional infrastructure.
- **Concurrent write safety.** No fencing tokens or distributed locks.
- **Transport.** uWrap defines the package format, not how packages move between systems.
- **Economic model.** No concept of challenges as assets or confidence as currency.

These are potential future extensions, not current guarantees.

---

## 11. Comparable Standards

| Standard | Scope | uWrap Relationship |
|----------|-------|-------------------|
| SLSA | Supply chain provenance | uWrap is proof-of-work, not proof-of-origin |
| SARIF | Static analysis results | uWrap wraps any result type, not just analysis |
| JUnit XML | Test results | uWrap adds integrity chain and evidence |
| OCI | Container images | uWrap is for work units, not deployable artifacts |

uWrap is closest to SLSA in spirit but operates at the work-unit level rather than the build level.

---

## 12. Versioning

This is v0.1.0. The version field in manifest.json tracks the format version.

Breaking changes require a major version bump. The current contract:

- Required files will not be removed
- Required manifest fields will not be removed
- The integrity chain (hashes.txt + TREE_HASH.txt) will not change
- New required fields may be added in minor versions
- Optional fields may be added in patch versions

---

## 13. License

[To be determined before public release]
