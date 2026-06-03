// ══════════════════════════════════════════════════════════════════
// Audit Service — StrokeSuite
// In-memory audit log with localStorage persistence.
// For production, this would POST to a secure backend.
// ══════════════════════════════════════════════════════════════════

import type { AuditEntry, AuditAction } from '@/types/compliance';

const STORAGE_KEY = 'stroke_audit_log';
const MAX_LOCAL_ENTRIES = 500;

class AuditService {
  private entries: AuditEntry[] = [];
  private sessionId: string;

  constructor() {
    this.sessionId = `sess_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
    this.loadFromStorage();
  }

  private loadFromStorage(): void {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        this.entries = JSON.parse(stored);
      }
    } catch {
      this.entries = [];
    }
  }

  private persist(): void {
    try {
      // Keep only last MAX_LOCAL_ENTRIES
      const toStore = this.entries.slice(-MAX_LOCAL_ENTRIES);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(toStore));
    } catch {
      // Storage full — trim aggressively
      try {
        const toStore = this.entries.slice(-100);
        localStorage.setItem(STORAGE_KEY, JSON.stringify(toStore));
      } catch {
        // Give up on local persistence for this session
      }
    }
  }

  /**
   * Record an auditable action.
   * Returns the entry ID for traceability.
   */
  record(
    action: AuditAction,
    options: {
      userId?: string | null;
      resourceType?: string;
      resourceId?: string;
      metadata?: Record<string, unknown>;
      ipAddress?: string;
      userAgent?: string;
    } = {},
  ): string {
    const id = `aud_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
    const entry: AuditEntry = {
      id,
      timestamp: new Date().toISOString(),
      userId: options.userId || null,
      sessionId: this.sessionId,
      action,
      resourceType: options.resourceType,
      resourceId: options.resourceId,
      metadata: options.metadata,
      ipAddress: options.ipAddress,
      userAgent: options.userAgent,
    };
    this.entries.push(entry);
    this.persist();
    return id;
  }

  /**
   * Query audit log with filters.
   */
  query(filters: {
    userId?: string;
    action?: AuditAction;
    resourceType?: string;
    since?: string;      // ISO-8601
    until?: string;
    limit?: number;
  } = {}): AuditEntry[] {
    let results = [...this.entries];

    if (filters.userId) {
      results = results.filter((e) => e.userId === filters.userId);
    }
    if (filters.action) {
      results = results.filter((e) => e.action === filters.action);
    }
    if (filters.resourceType) {
      results = results.filter((e) => e.resourceType === filters.resourceType);
    }
    if (filters.since) {
      results = results.filter((e) => e.timestamp >= filters.since!);
    }
    if (filters.until) {
      results = results.filter((e) => e.timestamp <= filters.until!);
    }

    results.sort((a, b) => b.timestamp.localeCompare(a.timestamp));
    return results.slice(0, filters.limit || 100);
  }

  /**
   * Get count of actions grouped by type (for dashboard).
   */
  getSummary(daysBack: number = 7): Record<string, number> {
    const since = new Date(Date.now() - daysBack * 86400000).toISOString();
    const recent = this.entries.filter((e) => e.timestamp >= since);
    const summary: Record<string, number> = {};
    for (const entry of recent) {
      summary[entry.action] = (summary[entry.action] || 0) + 1;
    }
    return summary;
  }

  /** Clear local log (for testing or user request) */
  clear(): void {
    this.entries = [];
    try { localStorage.removeItem(STORAGE_KEY); } catch { /* noop */ }
  }

  /** Export for data portability */
  exportAll(): AuditEntry[] {
    return [...this.entries];
  }

  /** Get current session ID */
  getSessionId(): string {
    return this.sessionId;
  }
}

// Singleton
export const auditService = new AuditService();
export default auditService;