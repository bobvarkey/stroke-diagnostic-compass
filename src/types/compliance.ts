// ══════════════════════════════════════════════════════════════════
// Core Compliance Types — StrokeSuite
// All policy/consent/audit types are centralized here for
// versioning, serialization, and testability.
// ══════════════════════════════════════════════════════════════════

export interface PolicyVersion {
  id: string;
  type: 'privacy' | 'terms' | 'disclaimer' | 'consent';
  version: string;           // semver, e.g. "1.0.0"
  title: string;
  content: string;           // Markdown body
  effectiveDate: string;     // ISO-8601
  previousVersion: string | null;
  changeLog: string;
}

export interface ConsentRecord {
  id: string;
  userId: string | null;     // null for unauthenticated demo users
  policyType: 'privacy' | 'terms' | 'disclaimer' | 'data_collection' | 'analytics';
  policyVersion: string;
  consented: boolean;
  consentedAt: string;       // ISO-8601
  ipAddress?: string;
  userAgent?: string;
  method: 'checkbox' | 'button' | 'implicit' | 'admin_override';
}

export interface DataCollectionField {
  field: string;
  category: 'required' | 'optional' | 'analytics_only';
  purpose: string;
  retentionDays: number;
  disclosedIn: string[];     // policy version IDs that disclose this field
}

export interface DataDeletionRequest {
  id: string;
  userId: string;
  email: string;
  reason?: string;
  requestedAt: string;
  status: 'pending' | 'in_progress' | 'completed' | 'rejected';
  completedAt?: string;
  exportProvided: boolean;
}

export interface DataExportRequest {
  id: string;
  userId: string;
  requestedAt: string;
  status: 'pending' | 'in_progress' | 'completed';
  completedAt?: string;
  format: 'json' | 'csv';
  includesPII: boolean;
}

// ══════════════════════════════════════════════════════════════════
// Audit Log Types
// ══════════════════════════════════════════════════════════════════

export type AuditAction =
  // Authentication
  | 'auth.login'
  | 'auth.logout'
  | 'auth.login_failed'
  | 'auth.password_reset'
  // Patient Data
  | 'patient.create'
  | 'patient.update'
  | 'patient.delete'
  | 'patient.view'
  | 'patient.export'
  // Clinical Actions
  | 'clinical.calculator_used'
  | 'clinical.algorithm_viewed'
  | 'clinical.report_generated'
  | 'clinical.report_exported'
  // Compliance
  | 'compliance.consent_granted'
  | 'compliance.consent_revoked'
  | 'compliance.policy_viewed'
  | 'compliance.data_deletion_requested'
  | 'compliance.data_export_requested'
  | 'compliance.data_export_completed'
  // Admin
  | 'admin.user_role_changed'
  | 'admin.policy_updated'
  | 'admin.system_config_changed'
  // Security
  | 'security.unauthorized_access_attempt'
  | 'security.rate_limit_exceeded'
  | 'security.suspicious_activity';

export interface AuditEntry {
  id: string;
  timestamp: string;         // ISO-8601
  userId: string | null;
  sessionId: string;
  action: AuditAction;
  resourceType?: string;     // e.g. 'patient', 'policy', 'report'
  resourceId?: string;
  metadata?: Record<string, unknown>;
  ipAddress?: string;
  userAgent?: string;
  geoLocation?: string;
}

// ══════════════════════════════════════════════════════════════════
// Accessibility Types
// ══════════════════════════════════════════════════════════════════

export interface ColorContrastResult {
  foreground: string;
  background: string;
  ratio: number;
  passesAA: boolean;        // >= 4.5:1 for normal text
  passesAAA: boolean;       // >= 7:1 for normal text
  passesAALarge: boolean;   // >= 3:1 for large text (>=18px or >=14px bold)
  element: string;          // CSS selector or component name
  context: string;          // where this pair appears
}

export interface AccessibilityAudit {
  timestamp: string;
  version: string;
  results: ColorContrastResult[];
  failures: ColorContrastResult[];
  summary: {
    total: number;
    aaPass: number;
    aaaPass: number;
    failures: number;
  };
}

// ══════════════════════════════════════════════════════════════════
// Release Gate Types
// ══════════════════════════════════════════════════════════════════

export type GateStatus = 'pass' | 'fail' | 'not_checked';
export type GateSeverity = 'blocker' | 'warning' | 'info';

export interface ReleaseGate {
  id: string;
  name: string;
  description: string;
  category: 'accessibility' | 'privacy' | 'consent' | 'security' | 'content' | 'legal' | 'store_compliance';
  severity: GateSeverity;
  status: GateStatus;
  checkedBy?: string;
  checkedAt?: string;
  notes?: string;
  remediation?: string;
}

export interface ReleaseChecklist {
  version: string;
  buildNumber: string;
  platform: 'ios' | 'android' | 'both';
  createdAt: string;
  updatedAt: string;
  gates: ReleaseGate[];
  overallStatus: 'blocked' | 'warning' | 'ready';
  signedOffBy?: string;
  signedOffAt?: string;
}

// ══════════════════════════════════════════════════════════════════
// Store Listing Compliance
// ══════════════════════════════════════════════════════════════════

export interface PrivacyDataType {
  type: string;
  purpose: string;
  collected: boolean;
  shared: boolean;
  linkedToUser: boolean;
  retentionPeriod: string;
}

export interface AppStorePrivacyDetail {
  dataTypes: PrivacyDataType[];
  lastUpdated: string;
  privacyUrl: string;
}

export interface GooglePlayHealthDeclaration {
  isHealthApp: boolean;
  isMedicalApp: boolean;
  dataAccuracyClaim: string;
  disclaimers: string[];
  regulatoryStatus: 'consumer_education' | 'clinical_decision_support' | 'medical_device';
}

// ══════════════════════════════════════════════════════════════════
// Analytics (Privacy-Respecting)
// ══════════════════════════════════════════════════════════════════

export interface AnalyticsEvent {
  name: string;
  category: 'engagement' | 'feature_usage' | 'performance' | 'error' | 'compliance';
  optional: boolean;         // if true, requires explicit consent
  data: Record<string, string | number | boolean>;
}

export const ALLOWED_ANALYTICS_EVENTS: AnalyticsEvent[] = [
  { name: 'app_launch', category: 'engagement', optional: false, data: {} },
  { name: 'screen_view', category: 'engagement', optional: false, data: { screen: '' } },
  { name: 'calculator_used', category: 'feature_usage', optional: true, data: { calculator: '' } },
  { name: 'report_generated', category: 'feature_usage', optional: true, data: { type: '' } },
  { name: 'error_occurred', category: 'error', optional: false, data: { code: '' } },
  { name: 'consent_interaction', category: 'compliance', optional: false, data: { action: '' } },
];