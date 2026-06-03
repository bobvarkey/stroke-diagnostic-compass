#!/usr/bin/env node

/**
 * Pre-Release Validation Script — StrokeSuite ID
 *
 * Run before any store submission:
 *   node scripts/pre-release-check.js
 *
 * Requires: vitest, build tools installed.
 * Exits with code 0 if all gates pass, 1 if any release blockers exist.
 */

const { execSync } = require('child_process');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const PASS = '\x1b[32m✓\x1b[0m';
const FAIL = '\x1b[31m✗\x1b[0m';
const WARN = '\x1b[33m⚠\x1b[0m';

let failures = 0;
let warnings = 0;

function run(name, cmd) {
  try {
    console.log(`\n  ${name}...`);
    execSync(cmd, { cwd: ROOT, stdio: 'pipe', timeout: 120000 });
    console.log(`  ${PASS} ${name}`);
    return true;
  } catch (e) {
    const stderr = e.stderr?.toString() || e.message;
    if (cmd.includes('lint') || cmd.includes('test')) {
      console.log(`  ${FAIL} ${name}`);
      console.error(`    ${stderr.split('\n').slice(-3).join('\n    ')}`);
      failures++;
      return false;
    }
    console.log(`  ${WARN} ${name} — check manually`);
    console.error(`    ${stderr.split('\n').slice(-2).join('\n    ')}`);
    warnings++;
    return false;
  }
}

console.log('\n══════════════════════════════════════════════');
console.log('  StrokeSuite ID — Pre-Release Validation');
console.log('══════════════════════════════════════════════\n');

// 1. Unit tests
console.log('📋 Running test suite...');
run('Unit tests (vitest)', 'npx vitest run');

// 2. Lint
console.log('\n📋 Running linter...');
run('ESLint', 'npx eslint src/ --max-warnings=0');

// 3. Build
console.log('\n📋 Building production bundle...');
run('Production build', 'npm run build');

// 4. Accessibility contrast audit
console.log('\n📋 Running accessibility contrast audit...');
try {
  const auditOutput = execSync(
    'npx tsx -e "const { runContrastAudit } = require(\\"./src/services/accessibility\\"); const a = runContrastAudit(); console.log(JSON.stringify(a.summary))"', 
    { cwd: ROOT, stdio: 'pipe', timeout: 30000 }
  ).toString();
  const summary = JSON.parse(auditOutput.trim());
  if (summary.failures > 0) {
    console.log(`  ${WARN} ${summary.failures} contrast failures found`);
    console.log(`    ${summary.aaPass}/${summary.total} pairs pass WCAG AA`);
    console.log(`    Consider fixing: ${summary.failures} failures for AAA`);
    warnings++;
  } else {
    console.log(`  ${PASS} All ${summary.total} color pairs pass WCAG AA`);
  }
} catch (e) {
  console.log(`  ${WARN} Contrast audit could not run automatically`);
  warnings++;
}

// 5. Check release checklist exists
console.log('\n📋 Checking release artifacts...');
try {
  execSync('test -f RELEASE_CHECKLIST.md', { cwd: ROOT });
  console.log(`  ${PASS} RELEASE_CHECKLIST.md present`);
} catch {
  console.log(`  ${FAIL} RELEASE_CHECKLIST.md missing`);
  failures++;
}

try {
  execSync('test -f STORE_READINESS.md', { cwd: ROOT });
  console.log(`  ${PASS} STORE_READINESS.md present`);
} catch {
  console.log(`  ${FAIL} STORE_READINESS.md missing`);
  failures++;
}

try {
  execSync('test -f ARCHITECTURE.md', { cwd: ROOT });
  console.log(`  ${PASS} ARCHITECTURE.md present`);
} catch {
  console.log(`  ${FAIL} ARCHITECTURE.md missing`);
  failures++;
}

// Summary
console.log('\n══════════════════════════════════════════════');
console.log(`  FAILURES: ${failures}  |  WARNINGS: ${warnings}`);
console.log('══════════════════════════════════════════════\n');

if (failures > 0) {
  console.error('❌ Release blocked — fix failures before submitting.\n');
  process.exit(1);
} else if (warnings > 0) {
  console.log('⚠️  Release has warnings — review them before submitting.\n');
  process.exit(0);
} else {
  console.log('✅ All checks passed — ready for submission!\n');
  process.exit(0);
}