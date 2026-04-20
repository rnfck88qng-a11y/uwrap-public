# STRONG vs WEAK Guards

STRONG and WEAK guards are a bounded execution pattern for separating authoritative control paths from advisory ones.

## STRONG guard

A STRONG guard is an authoritative execution boundary requiring explicit interceptor clearance.

Use STRONG where:
- execution must be explicitly authorized
- advisory logic must not be able to self-upgrade into authority
- external targets cross a real boundary

## WEAK guard

A WEAK guard is advisory or environment-level control.

Use WEAK where:
- configuration influences behavior
- local context exists
- the path is informative, not sovereign

## Why the distinction matters

Without this separation, advisory logic can blur into authoritative execution.

The pattern exists to preserve:
- bounded execution
- clearer enforcement semantics
- easier review of authority paths
- safer wrapper and import patterns

## Truth boundary

The STRONG/WEAK distinction is public-safe as doctrine.

Its strongest bounded implementation claim is narrower:
it is proven at the Sentinel boundary, not yet uniformly enforced across the full stack.
