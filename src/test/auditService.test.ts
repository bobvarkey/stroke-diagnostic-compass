// ══════════════════════════════════════════════════════════════════
// Audit Service Tests
// ══════════════════════════════════════════════════════════════════

import { describe, it, expect, beforeEach } from 'vitest';
import { auditService } from '@/services/auditService';

describe('AuditService', () => {
  beforeEach(() => {
    auditService.clear();
  });

  it('records an audit entry', () => {
    const id = auditService.record('auth.login', { userId: 'user-1' });
    expect(id).toMatch(/^aud_/);
  });

  it('queries by userId', () => {
    auditService.record('auth.login', { userId: 'user-1' });
    auditService.record('auth.login', { userId: 'user-2' });
    auditService.record('auth.login', { userId: 'user-1' });

    const results = auditService.query({ userId: 'user-1' });
    expect(results).toHaveLength(2);
    expect(results.every((r) => r.userId === 'user-1')).toBe(true);
  });

  it('queries by action', () => {
    auditService.record('auth.login', { userId: 'user-1' });
    auditService.record('patient.create', { userId: 'user-1' });
    auditService.record('compliance.consent_granted', { userId: 'user-1' });

    const results = auditService.query({ action: 'patient.create' });
    expect(results).toHaveLength(1);
    expect(results[0].action).toBe('patient.create');
  });

  it('returns results sorted by timestamp descending', async () => {
    auditService.record('auth.login', { userId: 'u1' });
    // Wait 2ms so timestamp differs
    await new Promise((r) => setTimeout(r, 2));
    const second = auditService.record('patient.create', { userId: 'u1' });

    const results = auditService.query({ userId: 'u1' });
    expect(results[0].id).toBe(second);
  });

  it('respects limit parameter', () => {
    for (let i = 0; i < 10; i++) {
      auditService.record('auth.login', { userId: 'u1' });
    }
    const results = auditService.query({ limit: 3 });
    expect(results).toHaveLength(3);
  });

  it('includes sessionId in entries', () => {
    const id = auditService.record('auth.login', { userId: 'u1' });
    const entries = auditService.query({ userId: 'u1' });
    expect(entries[0].sessionId).toBeTruthy();
    expect(typeof entries[0].sessionId).toBe('string');
  });

  it('includes metadata when provided', () => {
    auditService.record('clinical.calculator_used', {
      userId: 'u1',
      resourceType: 'calculator',
      resourceId: 'nihss',
      metadata: { value: 12, severity: 'moderate' },
    });

    const results = auditService.query({ resourceType: 'calculator' });
    expect(results[0].metadata).toEqual({ value: 12, severity: 'moderate' });
  });

  it('returns summary grouped by action', () => {
    auditService.record('auth.login', { userId: 'u1' });
    auditService.record('auth.login', { userId: 'u1' });
    auditService.record('patient.create', { userId: 'u1' });

    const summary = auditService.getSummary(7);
    expect(summary['auth.login']).toBe(2);
    expect(summary['patient.create']).toBe(1);
  });

  it('clears all entries', () => {
    auditService.record('auth.login', { userId: 'u1' });
    auditService.clear();
    expect(auditService.query()).toHaveLength(0);
  });
});