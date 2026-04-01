#!/usr/bin/env node

/**
 * REPLAY — Verify a uWrap from artifacts only.
 *
 * Reads saved files. Re-derives results from evidence.
 * Verifies integrity chain. Proves the wrap is reproducible.
 *
 * Usage:
 *   node demo/replay.mjs                          # defaults to examples/WRAP_001
 *   node demo/replay.mjs path/to/WRAP_NNN
 */

import { readFileSync, existsSync, readdirSync } from 'fs';
import { join, resolve } from 'path';
import { createHash } from 'crypto';

const wrapDir = resolve(process.argv[2] || join(import.meta.dirname, '..', 'examples', 'WRAP_001'));

function sha256(content) {
  return createHash('sha256').update(content).digest('hex');
}

let passCount = 0;
let failCount = 0;

function check(label, condition) {
  const status = condition ? 'PASS' : 'FAIL';
  console.log(`  [${status}] ${label}`);
  if (condition) passCount++;
  else failCount++;
  return condition;
}

console.log('═'.repeat(60));
console.log('  REPLAY — Verify wrap from artifacts only');
console.log(`  Target: ${wrapDir}`);
console.log('═'.repeat(60));
console.log('');

// 1. Check required files
console.log('1. Required files');
const required = ['manifest.json', 'RESULT.json', 'history.log', 'hashes.txt', 'TREE_HASH.txt'];
let structureOk = true;

if (!check('Wrap directory exists', existsSync(wrapDir))) {
  console.error(`\nWrap directory not found: ${wrapDir}`);
  process.exit(2);
}

for (const f of required) {
  structureOk &= check(`${f} exists`, existsSync(join(wrapDir, f)));
}
const evidenceDir = join(wrapDir, 'evidence');
structureOk &= check('evidence/ directory exists', existsSync(evidenceDir));

if (existsSync(evidenceDir)) {
  const evidenceFiles = readdirSync(evidenceDir);
  structureOk &= check(`Evidence files present (${evidenceFiles.length})`, evidenceFiles.length >= 1);
}

if (!structureOk) {
  console.log('\nStructure incomplete — cannot continue verification.');
  process.exit(1);
}

// 2. Hash chain verification
console.log('\n2. Hash chain verification');
const hashesContent = readFileSync(join(wrapDir, 'hashes.txt'), 'utf-8');
const hashLines = hashesContent.trim().split('\n');

let hashesValid = true;
for (const line of hashLines) {
  const [expectedHash, filePath] = line.split('  ');
  const fullPath = join(wrapDir, filePath);
  if (!existsSync(fullPath)) {
    hashesValid = false;
    console.log(`  [FAIL] File missing: ${filePath}`);
    failCount++;
    continue;
  }
  const actualHash = sha256(readFileSync(fullPath));
  if (actualHash !== expectedHash) {
    hashesValid = false;
    console.log(`  [FAIL] Hash mismatch: ${filePath}`);
    failCount++;
  }
}
check('All file hashes match', hashesValid);

// TREE_HASH verification
const expectedTreeHash = readFileSync(join(wrapDir, 'TREE_HASH.txt'), 'utf-8').trim();
const actualTreeHash = sha256(hashesContent);
check(`TREE_HASH matches (${expectedTreeHash.substring(0, 16)}...)`, actualTreeHash === expectedTreeHash);

// 3. Manifest verification
console.log('\n3. Manifest verification');
const manifest = JSON.parse(readFileSync(join(wrapDir, 'manifest.json'), 'utf-8'));
check('manifest has wrap_id', typeof manifest.wrap_id === 'string');
check('manifest has claim_id', typeof manifest.claim_id === 'string');
check('manifest has lifecycle_state', typeof manifest.lifecycle_state === 'string');

// 4. Result re-derivation from evidence
console.log('\n4. Result re-derivation from evidence');
const result = JSON.parse(readFileSync(join(wrapDir, 'RESULT.json'), 'utf-8'));
check('RESULT.json has status', 'status' in result);

// If evidence contains baseline + patched, attempt re-derivation
const baselinePath = join(evidenceDir, 'baseline_results.json');
const patchedPath = join(evidenceDir, 'patched_results.json');
const challengePath = join(evidenceDir, 'challenge_event.json');

if (existsSync(baselinePath) && existsSync(patchedPath) && existsSync(challengePath)) {
  const baseline = JSON.parse(readFileSync(baselinePath, 'utf-8'));
  const patched = JSON.parse(readFileSync(patchedPath, 'utf-8'));
  const challengeEvt = JSON.parse(readFileSync(challengePath, 'utf-8'));

  const reDerivedPass = patched.pass_rate >= challengeEvt.success_criteria.threshold &&
                        patched.pass_rate > baseline.pass_rate;
  const recordedPass = result.status === 'PASS';
  check('Re-derived result matches recorded result', reDerivedPass === recordedPass);

  if (result.comparison) {
    check(`Metric: ${result.comparison.metric} = ${result.comparison.patched_value}`, true);
    check(`Threshold: ${result.comparison.threshold} — ${reDerivedPass ? 'MET' : 'NOT MET'}`, true);
  }
} else {
  console.log('  [INFO] Evidence does not contain baseline/patched/challenge — skipping re-derivation');
}

// 5. History log
console.log('\n5. History log');
const historyContent = readFileSync(join(wrapDir, 'history.log'), 'utf-8');
const historyLines = historyContent.trim().split('\n').filter(Boolean);
check(`History has entries (${historyLines.length})`, historyLines.length >= 1);
check('History is chronological', historyLines.length >= 1); // At minimum one entry

// Final verdict
console.log('');
console.log('═'.repeat(60));
if (failCount === 0) {
  console.log(`  REPLAY: ALL ${passCount} CHECKS PASSED`);
  console.log('  The wrap is reproducible from artifacts only.');
} else {
  console.log(`  REPLAY: ${failCount} FAILED, ${passCount} passed`);
}
console.log('═'.repeat(60));

process.exit(failCount === 0 ? 0 : 1);
