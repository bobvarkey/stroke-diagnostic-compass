// ══════════════════════════════════════════════════════════════════
// Release Gate Tests
// Validates that automated release gates produce correct output.
// ══════════════════════════════════════════════════════════════════

import { describe, it, expect } from 'vitest';
import { runReleaseGates, formatReleaseChecklist } from './releaseGates';

describe('Release Gates', () => {
  it('returns a checklist with gates', () => {
    const checklist = runReleaseGates('both');
    expect(checklist.gates.length).toBeGreaterThan(10);
    expect(checklist.overallStatus).toBeDefined();
  });

  it('has all required fields on each gate', () => {
    const checklist = runReleaseGates('both');
    for (const gate of checklist.gates) {
      expect(gate).toHaveProperty('id');
      expect(gate).toHaveProperty('name');
      expect(gate).toHaveProperty('category');
      expect(gate).toHaveProperty('severity');
      expect(gate).toHaveProperty('status');
      expect(['pass', 'fail', 'not_checked']).toContain(gate.status);
    }
  });

  it('includes platform-specific gates', () => {
    const ios = runReleaseGates('ios');
    const android = runReleaseGates('android');
    expect(ios.gates.some((g) => g.id.startsWith('AS-'))).toBe(true);
    expect(android.gates.some((g) => g.id.startsWith('GP-'))).toBe(true);
  });

  it('formats checklist as readable text', () => {
    const checklist = runReleaseGates('both');
    const text = formatReleaseChecklist(checklist);
    expect(text).toContain('StrokeSuite ID');
    expect(text).toContain(checklist.overallStatus.toUpperCase());
    expect(text).toContain('✅');
    expect(text).toContain('⬜');
  });

  it('has no duplicate gate IDs', () => {
    const checklist = runReleaseGates('both');
    const ids = checklist.gates.map((g) => g.id);
    const uniqueIds = new Set(ids);
    expect(uniqueIds.size).toBe(ids.length);
  });
});