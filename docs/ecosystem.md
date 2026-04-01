# uWrap Ecosystem

uWrap is designed to integrate with existing tooling rather than replace it.

- uWrap focuses on packaging and validating work-unit artifacts.
- Other systems handle distribution, trust, and policy.

## Overview

```
Execution (CI / uLab)
        |
      uWrap
 (artifact + evidence + hashes)
        |
     OCI (optional)
 (distribution layer)
        |
   Sigstore (optional)
 (signing + verification)
        |
      OPA (optional)
 (policy enforcement)
```

---

## OCI — Distribution

uWrap artifacts can be packaged and stored in OCI-compatible registries.

### Minimal packaging

```bash
tar -czf WRAP_001.tar.gz WRAP_001/
```

### Push to registry (ORAS)

```bash
oras push ghcr.io/<org>/uwrap/WRAP_001:0.1.0 \
  --artifact-type application/vnd.uwrap.v1 \
  WRAP_001.tar.gz:application/vnd.uwrap.layer.v1.tar+gzip
```

### Pull

```bash
oras pull ghcr.io/<org>/uwrap/WRAP_001:0.1.0
```

OCI is used for distribution only. uWrap validation remains the source of truth.

---

## Sigstore — Signing (Planned)

Future versions of uWrap may support optional signing.

### Proposed model

- Sign `TREE_HASH.txt`
- Store signature as `SIGNATURE.sigstore.json`
- Verify using Sigstore tools

### Trust levels

| State | Meaning |
|-------|---------|
| valid | Passes validator |
| valid + signed | Signature present |
| valid + verified | Signature matches trusted identity |

Signing is not part of v0.1.

---

## OPA — Policy Enforcement

uWrap validation answers: *"Is this artifact structurally valid?"*

OPA answers: *"Is this artifact allowed?"*

### Example flow

```
uWrap → validate → OPA → allow / deny
```

### Example policy

```rego
package uwrap

deny[msg] {
  input.manifest.lifecycle_state != "VERIFIED"
  msg := "wrap must be VERIFIED"
}
```

OPA operates on structured data derived from the wrap. See `opa/` for example policies.

---

## Relationship to Other Standards

| Layer | Tool |
|-------|------|
| Build provenance | SLSA / in-toto |
| Work-unit evidence | uWrap |
| Policy enforcement | OPA |
| Distribution | OCI |
| Signing | Sigstore |

uWrap operates at the work-unit evidence layer.

---

## Design Principles

- Validator defines compliance
- Packaging is separate from transport
- Integrity is separate from trust
- Policy is external to validation

---

## Summary

uWrap does one thing: define a portable, verifiable artifact for a unit of work.

It integrates with existing systems for:

- Distribution (OCI)
- Trust (Sigstore)
- Enforcement (OPA)
