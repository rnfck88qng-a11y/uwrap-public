# uWrap OPA Policies

Example OPA policies for enforcing rules on validated uWraps.

## Usage

1. Run the uWrap validator with JSON output:
   ```bash
   node ci/validate_wrap.mjs --json path/to/wrap > validator_output.json
   ```

2. Build the OPA input (combine validator output with manifest/result/signature data)

3. Evaluate against policies:
   ```bash
   opa eval -i input.json -d policies/ "data.uwrap.deny"
   ```

## Policies

| Policy | Purpose |
|--------|---------|
| `trust.rego` | Require valid wrap, verify signatures for trusted lane |
| `lifecycle.rego` | Require specific lifecycle state (e.g., VERIFIED) |
| `source.rego` | Restrict which systems can produce wraps |

## Pattern

```
validator = structure + integrity
OPA = admission policy
```

Validate first, then apply policy. Never skip validation.
