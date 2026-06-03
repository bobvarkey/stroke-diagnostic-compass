// ══════════════════════════════════════════════════════════════════
// Consent Service Tests
// ══════════════════════════════════════════════════════════════════

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { consentService } from '@/services/consentService';

// Mock localStorage
const store: Record<string, string> = {};
const localStorageMock = {
  getItem: vi.fn((key: string) => store[key] ?? null),
  setItem: vi.fn((key: string, value: string) => { store[key] = value; }),
  removeItem: vi.fn((key: string) => { delete store[key]; }),
  clear: vi.fn(() => { Object.keys(store).forEach((k) => delete store[k]); }),
  get length() { return Object.keys(store).length; },
  key: vi.fn((index: number) => Object.keys(store)[index] ?? null),
};
Object.defineProperty(globalThis, 'localStorage', { value: localStorageMock });

describe('ConsentService', () => {
  beforeEach(() => {
    Object.keys(store).forEach((k) => delete store[k]);
    vi.clearAllMocks();
  });

  it('records consent', () => {
    consentService.recordConsent('user-1', 'privacy', '1.0.0', true);
    expect(consentService.hasConsented('user-1', 'privacy', '1.0.0')).toBe(true);
  });

  it('records revoked consent', () => {
    consentService.recordConsent('user-1', 'privacy', '1.0.0', true);
    consentService.recordConsent('user-1', 'privacy', '1.0.0', false);
    expect(consentService.hasConsented('user-1', 'privacy', '1.0.0')).toBe(false);
  });

  it('returns false for unconsented policies', () => {
    expect(consentService.hasConsented('user-1', 'terms', '99.0.0')).toBe(false);
  });

  it('returns false for null userId', () => {
    expect(consentService.hasConsented(null, 'privacy', '1.0.0')).toBe(false);
  });

  it('tracks different policy types independently', () => {
    consentService.recordConsent('user-1', 'privacy', '1.0.0', true);
    consentService.recordConsent('user-1', 'terms', '1.0.0', false);
    expect(consentService.hasConsented('user-1', 'privacy', '1.0.0')).toBe(true);
    expect(consentService.hasConsented('user-1', 'terms', '1.0.0')).toBe(false);
  });

  it('getUserConsents returns all records for a user', () => {
    consentService.recordConsent('user-1', 'privacy', '1.0.0', true);
    consentService.recordConsent('user-1', 'terms', '1.0.0', true);
    const records = consentService.getUserConsents('user-1');
    expect(records).toHaveLength(2);
    expect(records.every((r) => r.userId === 'user-1')).toBe(true);
  });

  it('getUserConsents is empty for unknown user', () => {
    expect(consentService.getUserConsents('unknown')).toHaveLength(0);
  });

  it('deleteUserConsents removes all records', () => {
    consentService.recordConsent('user-1', 'privacy', '1.0.0', true);
    consentService.recordConsent('user-1', 'terms', '1.0.0', true);
    consentService.deleteUserConsents('user-1');
    expect(consentService.getUserConsents('user-1')).toHaveLength(0);
  });
});