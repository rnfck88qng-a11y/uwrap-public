#!/usr/bin/env node

/**
 * uWrap CI Validator
 *
 * Standalone validator for uWrap bundles. Designed to run in CI.
 * Zero external dependencies — Node built-ins only.
 *
 * Usage:
 *   node ci/validate_wrap.mjs <wrap-directory>
 *   node ci/validate_wrap.mjs demo/wraps/WRAP_001
 *   node ci/validate_wrap.mjs --json demo/wraps/WRAP_001    # JSON output for CI
 *
 * Exit codes:
 *   0 = all checks pass
 *   1 = one or more checks failed
 *   2 = usage error (missing argument, wrap dir not found)
 */

import { readFileSync, existsSync, readdirSync, statSync } from 'fs';
import { join, relative, resolve } from 'path';
import { createHash } from 'crypto';

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function sha256(content) {
  return createHash('sha256').update(content).digest('hex');
}

function hashFile(filePath) {
  return sha256(readFileSync(filePath));
}

function collectFiles(dir, base) {
  let files = [];
  for (const entry of readdirSync(dir)) {
    const full = join(dir, entry);
    const rel = relative(base, full);
    if (statSync(full).isDirectory()) {
      files = files.concat(collectFiles(full, base));
    } else if (entry !== 'TREE_HASH.txt' && entry !== 'hashes.txt' && !entry.startsWith('SIGNATURE.')) {
      files.push(rel);
    }
  }
  return files.sort();
}

// ---------------------------------------------------------------------------
// Schema validation (lightweight, no ajv dependency)
// ---------------------------------------------------------------------------

function validateManifestSchema(manifest, schema) {
  const errors = [];

  // Check required fields
  for (const field of schema.required || []) {
    if (!(field in manifest)) {
      errors.push(`Missing required field: ${field}`);
    }
  }

  // Check each present field against schema properties
  for (const [key, value] of Object.entries(manifest)) {
    const prop = schema.properties?.[key];
    if (!prop && schema.additionalProperties === false) {
      errors.push(`Unexpected field: ${key}`);
      continue;
    }
    if (!prop) continue;

    // Type check
    if (prop.type === 'string' && typeof value !== 'string') {
      errors.push(`${key}: expected string, got ${typeof value}`);
      continue;
    }
    if (prop.type === 'number' && typeof value !== 'number') {
      errors.push(`${key}: expected number, got ${typeof value}`);
      continue;
    }

    if (typeof value !== 'string') continue;

    // Pattern check
    if (prop.pattern && !new RegExp(prop.pattern).test(value)) {
      errors.push(`${key}: value "${value}" does not match pattern ${prop.pattern}`);
    }

    // Enum check
    if (prop.enum && !prop.enum.includes(value)) {
      errors.push(`${key}: value "${value}" not in allowed values [${prop.enum.join(', ')}]`);
    }

    // minLength check
    if (prop.minLength != null && value.length < prop.minLength) {
      errors.push(`${key}: value too short (min ${prop.minLength})`);
    }
  }

  return errors;
}

// ---------------------------------------------------------------------------
// Checks
// ---------------------------------------------------------------------------

function checkRequiredFiles(wrapDir) {
  const results = [];
  const required = [
    'manifest.json',
    'RESULT.json',
    'history.log',
    'hashes.txt',
    'TREE_HASH.txt',
  ];

  for (const file of required) {
    const exists = existsSync(join(wrapDir, file));
    results.push({
      check: `required_file:${file}`,
      pass: exists,
      detail: exists ? 'present' : 'MISSING',
    });
  }

  // evidence/ directory must exist and contain at least one file
  const evidenceDir = join(wrapDir, 'evidence');
  const evidenceDirExists = existsSync(evidenceDir) && statSync(evidenceDir).isDirectory();
  results.push({
    check: 'required_dir:evidence',
    pass: evidenceDirExists,
    detail: evidenceDirExists ? 'present' : 'MISSING',
  });

  if (evidenceDirExists) {
    const evidenceFiles = readdirSync(evidenceDir).filter(
      f => statSync(join(evidenceDir, f)).isFile()
    );
    const hasEvidence = evidenceFiles.length > 0;
    results.push({
      check: 'evidence_not_empty',
      pass: hasEvidence,
      detail: hasEvidence ? `${evidenceFiles.length} file(s)` : 'evidence/ is empty',
    });
  }

  return results;
}

function checkManifestSchema(wrapDir) {
  const results = [];
  const manifestPath = join(wrapDir, 'manifest.json');
  if (!existsSync(manifestPath)) {
    results.push({ check: 'manifest_schema', pass: false, detail: 'manifest.json not found' });
    return results;
  }

  let manifest;
  try {
    manifest = JSON.parse(readFileSync(manifestPath, 'utf-8'));
  } catch (e) {
    results.push({ check: 'manifest_parse', pass: false, detail: `Invalid JSON: ${e.message}` });
    return results;
  }
  results.push({ check: 'manifest_parse', pass: true, detail: 'valid JSON' });

  // Load schema
  const schemaPath = join(import.meta.dirname, '..', 'schemas', 'WRAP_MANIFEST.schema.json');
  if (!existsSync(schemaPath)) {
    results.push({ check: 'manifest_schema', pass: false, detail: 'Schema file not found' });
    return results;
  }
  const schema = JSON.parse(readFileSync(schemaPath, 'utf-8'));
  const errors = validateManifestSchema(manifest, schema);

  if (errors.length === 0) {
    results.push({ check: 'manifest_schema', pass: true, detail: 'all fields valid' });
  } else {
    for (const err of errors) {
      results.push({ check: 'manifest_schema', pass: false, detail: err });
    }
  }

  return results;
}

function checkHashChain(wrapDir) {
  const results = [];
  const hashesPath = join(wrapDir, 'hashes.txt');
  const treeHashPath = join(wrapDir, 'TREE_HASH.txt');

  if (!existsSync(hashesPath) || !existsSync(treeHashPath)) {
    results.push({ check: 'hash_chain', pass: false, detail: 'hashes.txt or TREE_HASH.txt missing' });
    return results;
  }

  const hashesContent = readFileSync(hashesPath, 'utf-8');
  const lines = hashesContent.trim().split('\n').filter(l => l.trim());

  // Verify each file hash
  let allMatch = true;
  for (const line of lines) {
    const match = line.match(/^([a-f0-9]{64})\s+(.+)$/);
    if (!match) {
      results.push({ check: 'hash_format', pass: false, detail: `Malformed line: ${line}` });
      allMatch = false;
      continue;
    }
    const [, expectedHash, filePath] = match;
    const fullPath = join(wrapDir, filePath);

    if (!existsSync(fullPath)) {
      results.push({ check: `hash_file:${filePath}`, pass: false, detail: 'file missing' });
      allMatch = false;
      continue;
    }

    const actualHash = hashFile(fullPath);
    if (actualHash !== expectedHash) {
      results.push({
        check: `hash_file:${filePath}`,
        pass: false,
        detail: `expected ${expectedHash.slice(0, 16)}..., got ${actualHash.slice(0, 16)}...`,
      });
      allMatch = false;
    }
  }

  if (allMatch) {
    results.push({ check: 'hash_files_all', pass: true, detail: `${lines.length} files verified` });
  }

  // Verify TREE_HASH = sha256(hashes.txt)
  const expectedTreeHash = readFileSync(treeHashPath, 'utf-8').trim();
  const actualTreeHash = sha256(hashesContent);

  results.push({
    check: 'tree_hash',
    pass: actualTreeHash === expectedTreeHash,
    detail: actualTreeHash === expectedTreeHash
      ? `${actualTreeHash.slice(0, 16)}... verified`
      : `expected ${expectedTreeHash.slice(0, 16)}..., got ${actualTreeHash.slice(0, 16)}...`,
  });

  // Verify hashes.txt covers all files in the wrap (no unlisted files)
  const listedFiles = new Set(lines.map(l => l.replace(/^[a-f0-9]{64}\s+/, '')));
  const actualFiles = collectFiles(wrapDir, wrapDir);
  const unlisted = actualFiles.filter(f => !listedFiles.has(f));
  const phantoms = [...listedFiles].filter(f => !actualFiles.includes(f));

  if (unlisted.length === 0 && phantoms.length === 0) {
    results.push({ check: 'hash_coverage', pass: true, detail: 'all files accounted for' });
  } else {
    if (unlisted.length > 0) {
      results.push({
        check: 'hash_coverage',
        pass: false,
        detail: `Files not in hashes.txt: ${unlisted.join(', ')}`,
      });
    }
    if (phantoms.length > 0) {
      results.push({
        check: 'hash_coverage',
        pass: false,
        detail: `Listed in hashes.txt but missing: ${phantoms.join(', ')}`,
      });
    }
  }

  return results;
}

function checkResultJson(wrapDir) {
  const results = [];
  const resultPath = join(wrapDir, 'RESULT.json');
  if (!existsSync(resultPath)) {
    results.push({ check: 'result_json', pass: false, detail: 'RESULT.json not found' });
    return results;
  }

  try {
    const result = JSON.parse(readFileSync(resultPath, 'utf-8'));
    results.push({ check: 'result_parse', pass: true, detail: 'valid JSON' });

    // Must have a status field
    if ('status' in result) {
      results.push({ check: 'result_has_status', pass: true, detail: `status: ${result.status}` });
    } else {
      results.push({ check: 'result_has_status', pass: false, detail: 'missing status field' });
    }
  } catch (e) {
    results.push({ check: 'result_parse', pass: false, detail: `Invalid JSON: ${e.message}` });
  }

  return results;
}

// ---------------------------------------------------------------------------
// Runner
// ---------------------------------------------------------------------------

function runValidation(wrapDir) {
  const allResults = [];

  allResults.push(...checkRequiredFiles(wrapDir));
  allResults.push(...checkManifestSchema(wrapDir));
  allResults.push(...checkHashChain(wrapDir));
  allResults.push(...checkResultJson(wrapDir));

  return allResults;
}

// ---------------------------------------------------------------------------
// Output
// ---------------------------------------------------------------------------

function printHuman(results, wrapDir) {
  console.log('');
  console.log('════════════════════════════════════════════════════════════');
  console.log('  uWrap CI Validator');
  console.log(`  Target: ${wrapDir}`);
  console.log('════════════════════════════════════════════════════════════');
  console.log('');

  let passCount = 0;
  let failCount = 0;

  for (const r of results) {
    const icon = r.pass ? '[PASS]' : '[FAIL]';
    console.log(`  ${icon} ${r.check} — ${r.detail}`);
    if (r.pass) passCount++;
    else failCount++;
  }

  console.log('');
  console.log('────────────────────────────────────────────────────────────');
  if (failCount === 0) {
    console.log(`  RESULT: ALL ${passCount} CHECKS PASSED`);
  } else {
    console.log(`  RESULT: ${failCount} FAILED, ${passCount} passed`);
  }
  console.log('────────────────────────────────────────────────────────────');
  console.log('');
}

function printJson(results, wrapDir) {
  const output = {
    validator: 'uwrap-ci-validator',
    version: '0.1.0',
    target: wrapDir,
    timestamp: new Date().toISOString(),
    passed: results.every(r => r.pass),
    total: results.length,
    pass_count: results.filter(r => r.pass).length,
    fail_count: results.filter(r => !r.pass).length,
    checks: results,
  };
  console.log(JSON.stringify(output, null, 2));
}

// ---------------------------------------------------------------------------
// CLI
// ---------------------------------------------------------------------------

const args = process.argv.slice(2);
const jsonMode = args.includes('--json');
const positional = args.filter(a => !a.startsWith('--'));

if (positional.length === 0) {
  console.error('Usage: node ci/validate_wrap.mjs [--json] <wrap-directory>');
  process.exit(2);
}

const wrapDir = resolve(positional[0]);

if (!existsSync(wrapDir) || !statSync(wrapDir).isDirectory()) {
  console.error(`Error: ${wrapDir} is not a directory`);
  process.exit(2);
}

const results = runValidation(wrapDir);
const allPassed = results.every(r => r.pass);

if (jsonMode) {
  printJson(results, wrapDir);
} else {
  printHuman(results, wrapDir);
}

process.exit(allPassed ? 0 : 1);
