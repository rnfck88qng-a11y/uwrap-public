# uWrap

A folder-based format for packaging AI work with explicit structure, evidence, and deterministic validation.

## What is uWrap?

uWrap is a directory structure for packaging AI work outputs together with metadata, result data, supporting evidence, and integrity hashes.

A valid uWrap makes it easier to inspect, validate, and replay a work unit from its packaged artifacts.

A minimal uWrap contains:

```
WRAP_001/
  manifest.json         Metadata about the wrap
  RESULT.json           Structured outcome
  evidence/             Supporting artifacts
  history.log           Append-only state log
  hashes.txt            SHA-256 per file
  TREE_HASH.txt         Root integrity hash
```

## What validation proves

The reference validator checks that a wrap is:

- **structurally complete**
- **schema-valid**
- **internally hash-consistent**
- **equipped with a parseable result containing a status field**

Passing validation means the wrap is structurally and integrity-valid.

Passing validation does **not** by itself prove that the underlying claim is true, that the evidence is sufficient, or that the wrap was produced by a trusted issuer.

## Validate a wrap

```bash
node ci/validate_wrap.mjs path/to/WRAP_001
```

14 checks across 4 layers:

| Layer | Checks | What it verifies |
|-------|--------|-----------------|
| Structural | 7 | Required files present, evidence non-empty |
| Schema | 2 | manifest.json is valid and conforms to schema |
| Integrity | 3 | File hashes match, TREE_HASH.txt matches, coverage complete |
| Semantic | 2 | RESULT.json parses and includes status |

Exit code `0` = valid. Exit code `1` = invalid. Use `--json` for machine-readable output.

The reference validator has zero external runtime dependencies and uses Node.js built-ins only.

## Example

`examples/WRAP_001/` is a real wrap derived from an internal proof cycle. It demonstrates a regression-style comparison between baseline and patched outcomes.

```bash
node ci/validate_wrap.mjs examples/WRAP_001
node demo/replay.mjs
```

## Specification

See [SPEC.md](SPEC.md) for the full v0.1 specification.

## Schemas

- `schemas/WRAP_MANIFEST.schema.json`
- `schemas/CHALLENGE_EVENT.schema.json`
- `schemas/BELIEF_UPDATE_EVENT.schema.json`

## CI Integration

Validate uWraps in CI. Fail the build if validation fails.

```yaml
- name: Validate uWrap
  run: node ci/validate_wrap.mjs path/to/wrap
```

See `.github/workflows/validate.yml` for a working example.

## Compliance

A valid uWrap is defined as a directory that passes the official validator.

If a package does not pass validation, it is not a uWrap.

The validator is the source of truth for compliance.

## Ecosystem

uWrap is designed to work with existing tooling:

- **OCI** — distribution of wrap artifacts via registries
- **Sigstore** — signing and verification (planned)
- **OPA** — policy enforcement (external)

uWrap focuses on packaging and validation of work units. Trust, distribution, and policy are handled by existing tools.

## What uWrap is NOT

- Not a runtime governance system
- Not a signature-based trust system in v0.1
- Not a transport protocol
- Not a guarantee that a claim is true
- Not an official trust stamp

## Status

v0.1.0 — first public release.

This release defines packaging and deterministic validation for the public contract. Signature-based trust and stamping are not part of v0.1.

## License

Apache-2.0
