// ══════════════════════════════════════════════════════════════════
// Consent Service — StrokeSuite
// Manages consent records with versioning and audit integration.
// ══════════════════════════════════════════════════════════════════

import type { ConsentRecord } from '@/types/compliance';
import { auditService } from './auditService';

const STORAGE_KEY_PREFIX = 'stroke_consent_';

class ConsentService {
  /**
   * Record consent (or revocation) for a policy version.
   */
  recordConsent(
    userId: string | null,
    policyType: ConsentRecord['policyType'],
    policyVersion: string,
    consented: boolean,
    method: ConsentRecord['method'] = 'checkbox',
  ): void {
    const record: ConsentRecord = {
      id: `cons_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
      userId,
      policyType,
      policyVersion,
      consented,
      consentedAt: new Date().toISOString(),
      method,
    };

    // Store locally (in production, also POST to backend)
    try {
      const key = `${STORAGE_KEY_PREFIX}${policyType}_${userId || 'anonymous'}_${policyVersion}`;
      localStorage.setItem(key, JSON.stringify(record));
    } catch { /* noop */ }

    // Audit
    const auditAction = consented ? 'compliance.consent_granted' as const : 'compliance.consent_revoked' as const;
    auditService.record(auditAction, {
      userId,
      resourceType: 'consent',
      resourceId: record.id,
      metadata: { policyType, policyVersion, method },
    });
  }

  /**
   * Check if user has granted consent for a specific policy version.
   */
  hasConsented(
    userId: string | null,
    policyType: ConsentRecord['policyType'],
    policyVersion: string,
  ): boolean {
    if (!userId) return false;
    try {
      const key = `${STORAGE_KEY_PREFIX}${policyType}_${userId}_${policyVersion}`;
      const stored = localStorage.getItem(key);
      if (!stored) return false;
      const record: ConsentRecord = JSON.parse(stored);
      return record.consented;
    } catch {
      return false;
    }
  }

  /**
   * Get all consent records for a user.
   */
  getUserConsents(userId: string): ConsentRecord[] {
    const records: ConsentRecord[] = [];
    try {
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key?.startsWith(STORAGE_KEY_PREFIX) && key.includes(userId)) {
          const stored = localStorage.getItem(key);
          if (stored) records.push(JSON.parse(stored));
        }
      }
    } catch { /* noop */ }
    return records.sort((a, b) => b.consentedAt.localeCompare(a.consentedAt));
  }

  /**
   * Delete all consent records for a user (on account deletion).
   */
  deleteUserConsents(userId: string): void {
    const keysToRemove: string[] = [];
    try {
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key?.startsWith(STORAGE_KEY_PREFIX) && key.includes(userId)) {
          keysToRemove.push(key);
        }
      }
      keysToRemove.forEach((k) => localStorage.removeItem(k));
    } catch { /* noop */ }
  }
}

export const consentService = new ConsentService();
export default consentService;