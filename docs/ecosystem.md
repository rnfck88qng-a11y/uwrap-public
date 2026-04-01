# uWrap Ecosystem Integration

uWrap is a packaging and validation layer. Distribution, signing, and policy enforcement are handled by existing tools.

```
[Execution] → [uWrap] → [OCI] → [Sigstore] → [OPA]
               validate    distribute   sign        enforce
```

---

## 1. OCI — Distribution

A uWrap may be distributed as a `.tar.gz` archive or stored in an OCI-compatible registry as an OCI artifact.

OCI packaging is a distribution layer. The uWrap validator remains the compliance authority.

### Packaging

```bash
tar -czf WRAP_001.tar.gz WRAP_001/
```

### OCI Push (via ORAS)

```bash
oras push ghcr.io/<org>/uwrap/WRAP_001:0.1.0 \
  --artifact-type application/vnd.uwrap.v1 \
  WRAP_001.tar.gz:application/vnd.uwrap.layer.v1.tar+gzip
```

### OCI Pull

```bash
oras pull ghcr.io/<org>/uwrap/WRAP_001:0.1.0
```

### Media Types

| Type | Value |
|------|-------|
| Artifact type | `application/vnd.uwrap.v1` |
| Tar layer | `application/vnd.uwrap.layer.v1.tar+gzip` |

---

## 2. Sigstore — Signing and Verification (v0.2)

Sign `TREE_HASH.txt` — the single root hash that anchors the entire wrap's integrity chain.

If `TREE_HASH.txt` is trusted, and `TREE_HASH.txt = sha256(hashes.txt)`, and `hashes.txt` covers every file, then trust anchors the whole wrap.

### Sign

```bash
cosign sign-blob TREE_HASH.txt --bundle SIGNATURE.sigstore.json
```

### Verify

```bash
cosign verify-blob TREE_HASH.txt \
  --bundle SIGNATURE.sigstore.json \
  --certificate-identity <expected-identity> \
  --certificate-oidc-issuer <expected-issuer>
```

### Trust States

| State | Meaning |
|-------|---------|
| valid | Passes uWrap validator |
| invalid | Fails uWrap validator |
| valid + unsigned | Structurally usable, not trusted by issuer |
| valid + signed | Structurally valid and signed |
| valid + verified issuer | Signed and verified against expected identity |

Structure and trust are separate. The validator checks structure. Sigstore checks origin.

### File Additions (v0.2)

| File | Purpose |
|------|---------|
| `SIGNATURE.sigstore.json` | Sigstore bundle (signature + certificate + transparency log proof) |

### Spec Rule (v0.2)

> A **signed uWrap** is a validator-valid uWrap whose TREE_HASH.txt has a verifiable Sigstore bundle.
> A **trusted uWrap** is a signed uWrap whose signing identity matches a configured trust policy.

---

## 3. OPA — Policy Enforcement (External)

Use OPA after uWrap validation, not instead of it. The pattern: validate first, then apply policy.

### Input Model

Feed OPA a normalized JSON object:

```json
{
  "validator": {
    "valid": true,
    "wrap_id": "WRAP_001"
  },
  "manifest": {
    "lifecycle_state": "PROPOSED",
    "source": "uLab"
  },
  "result": {
    "status": "PASS"
  },
  "signature": {
    "present": false,
    "verified": false,
    "issuer": null
  }
}
```

### Flow

```
validate_wrap.mjs --json → transform → OPA evaluate → allow / deny
```

Validator = structure + integrity. OPA = admission policy.

See `opa/` directory for example policies.

---

## 4. SLSA / in-toto — Concept Alignment

uWrap does not compete with SLSA. They cover different layers:

| Layer | Tool |
|-------|------|
| Build provenance | SLSA |
| Work-unit evidence | uWrap |

uWrap complements existing systems by packaging work-unit results with evidence and validation.
