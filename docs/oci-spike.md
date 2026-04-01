# OCI Distributability Spike

This document tracks the experimental spike to prove that a uWrap can be packaged, distributed via OCI, retrieved, and re-verified without loss of integrity.

## Prerequisites

ORAS is required to interact with OCI registries for arbitrary artifacts.

```bash
brew install oras
```

## Push/Pull Workflow

### 1. Package the Wrap

From the root repository, package the wrap as a tarball:

```bash
cd examples
tar -czf WRAP_001.tar.gz WRAP_001/
```

### 2. Push to Registry

**Registry Used:** GitHub Container Registry (GHCR)

*Note: OCI repository names must be strictly lowercase. The `WRAP_001` suffix was downcased to `wrap_001` for the push command.*

```bash
oras push ghcr.io/rnfck88qng-a11y/uwrap/wrap_001:0.1.0 \
  --artifact-type application/vnd.uwrap.v1 \
  WRAP_001.tar.gz:application/vnd.uwrap.layer.v1.tar+gzip
```

### 3. Pull and Revalidate

```bash
mkdir test_pull
cd test_pull

oras pull ghcr.io/rnfck88qng-a11y/uwrap/wrap_001:0.1.0
tar -xzf WRAP_001.tar.gz

node ../../ci/validate_wrap.mjs WRAP_001
```

## OCI Naming Constraints

OCI registries require lowercase repository names.

uWrap identifiers (e.g. WRAP_001) MUST be mapped when used in OCI references.

Example:

Internal:
WRAP_001

OCI reference:
wrap_001

This mapping applies only to transport. The internal uWrap structure remains unchanged.

## Authentication

Pushing uWrap artifacts to OCI registries requires authentication.

Example (GitHub Container Registry):

```bash
oras login ghcr.io -u <username> -p <token>
```

Pull operations may be unauthenticated depending on registry configuration.

## Important

OCI transport does not modify or validate the contents of a uWrap.

After pulling an artifact, the uWrap MUST be revalidated using the reference validator.
