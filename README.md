# uWrap

A folder-based format for verifiable AI work units.

## What is uWrap?

uWrap is a directory structure that packages AI work outputs with metadata, evidence, and tamper-evident integrity hashing. Every uWrap contains what was claimed, what was measured, proof of integrity, and a history of state changes.

```
WRAP_001/
  manifest.json         What this wrap is about
  RESULT.json           What was measured
  evidence/             Raw supporting data
  history.log           State transitions (append-only)
  hashes.txt            SHA-256 per file
  TREE_HASH.txt         Root integrity hash
```

## Validate a Wrap

```bash
node ci/validate_wrap.mjs path/to/WRAP_001
```

14 checks across 4 layers:

| Layer | Checks | What it verifies |
|-------|--------|-----------------|
| Structural | 7 | All required files present, evidence non-empty |
| Schema | 2 | manifest.json fields valid per JSON Schema |
| Integrity | 3 | Per-file hashes match, TREE_HASH verified, full coverage |
| Semantic | 2 | RESULT.json parseable with status field |

Exit code 0 = valid. Exit code 1 = invalid. Add `--json` for machine-readable output.

Zero external dependencies. Node.js built-ins only.

## Example

`examples/WRAP_001/` is a real wrap produced by the first governed proof cycle — not a synthetic example. It demonstrates a regression challenge: baseline (0.85 pass rate) vs patched (0.95 pass rate), threshold met, verdict PASS.

```bash
# Validate the example
node ci/validate_wrap.mjs examples/WRAP_001

# Verify from artifacts only
node demo/replay.mjs
```

## Specification

See [SPEC.md](SPEC.md) for the full v0.1 specification.

## Schemas

- `schemas/WRAP_MANIFEST.schema.json` — manifest.json validation
- `schemas/CHALLENGE_EVENT.schema.json` — challenge event contract
- `schemas/BELIEF_UPDATE_EVENT.schema.json` — belief update contract

## What uWrap is NOT

- Not a runtime governance system (validates packages, doesn't enforce usage)
- Not cryptographically signed (hash integrity, not non-repudiation)
- Not a transport protocol (defines the package, not how it moves)

## Status

v0.1.0 — First public release. Format is stable for the defined contract. Extensions planned but not yet specified.

## License

[TBD]
