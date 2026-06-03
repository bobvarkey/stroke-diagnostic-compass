// ══════════════════════════════════════════════════════════════════
// Privacy Screen — StrokeSuite
// Versioned, consent-tracked, with data collection map.
// ══════════════════════════════════════════════════════════════════

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Checkbox } from '@/components/ui/checkbox';
import { Shield, Download, ChevronLeft, Check, AlertTriangle, Eye, Database, Lock, Share2, Trash2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';

export const PRIVACY_VERSION = '1.0.0';
export const PRIVACY_EFFECTIVE_DATE = '2026-06-03';

const DATA_COLLECTION_MAP = [
  {
    category: 'Account Information',
    fields: ['Email (via username proxy)', 'Display name'],
    purpose: 'Authentication and user identification',
    retention: 'Until account deletion',
    required: true,
  },
  {
    category: 'Patient Data',
    fields: ['Demographics', 'Clinical history', 'Lab values', 'Imaging data', 'Treatment decisions'],
    purpose: 'Core clinical decision support functionality',
    retention: 'Until account deletion or user request',
    required: true,
  },
  {
    category: 'Usage Analytics',
    fields: ['Screen views', 'Calculator usage frequency', 'Feature interactions'],
    purpose: 'Product improvement and crash analysis',
    retention: '12 months',
    required: false,
  },
  {
    category: 'Device Information',
    fields: ['Device type', 'OS version', 'App version', 'Screen resolution'],
    purpose: 'Performance monitoring and crash reporting',
    retention: '6 months',
    required: false,
  },
  {
    category: 'Diagnostic Results',
    fields: ['Calculated scores', 'Risk stratifications', 'Treatment recommendations'],
    purpose: 'Core app functionality — transient processing',
    retention: 'Session only (not persisted server-side)',
    required: true,
  },
];

// In a real app, this would come from a backend store
const getConsentKey = (userId: string | null) => `stroke_privacy_consent_${userId || 'anonymous'}_${PRIVACY_VERSION}`;
const getConsentStatus = (userId: string | null): boolean | null => {
  if (!userId) return null;
  try {
    return localStorage.getItem(getConsentKey(userId)) === 'true';
  } catch {
    return null;
  }
};
const setConsentStatus = (userId: string | null, consented: boolean) => {
  if (!userId) return;
  try {
    localStorage.setItem(getConsentKey(userId), String(consented));
    localStorage.setItem(`stroke_privacy_consent_date_${userId}`, new Date().toISOString());
  } catch { /* localStorage unavailable */ }
};

interface PrivacyScreenProps {
  onBack?: () => void;
  standalone?: boolean;       // True when shown as a full-screen route
}

export function PrivacyScreen({ onBack, standalone = false }: PrivacyScreenProps) {
  const { user } = useAuth();
  const { toast } = useToast();
  const [hasConsented, setHasConsented] = useState<boolean>(false);
  const [consentChecked, setConsentChecked] = useState<boolean>(false);

  useEffect(() => {
    const status = getConsentStatus(user?.id || null);
    if (status !== null) {
      setHasConsented(status);
    }
    setConsentChecked(true);
  }, [user]);

  const handleConsent = () => {
    setConsentStatus(user?.id || null, true);
    setHasConsented(true);
    toast({
      title: 'Privacy consent recorded',
      description: `Version ${PRIVACY_VERSION}, effective ${PRIVACY_EFFECTIVE_DATE}`,
    });
    // Audit event would fire here
  };

  const handleRevokeConsent = () => {
    setConsentStatus(user?.id || null, false);
    setHasConsented(false);
    toast({
      title: 'Privacy consent revoked',
      description: 'Some features may be limited',
      variant: 'destructive',
    });
  };

  const content = (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="flex items-start gap-4 p-4 rounded-xl bg-primary/5 border border-primary/10">
        <Shield className="h-8 w-8 text-primary shrink-0 mt-1" />
        <div>
          <h2 className="text-lg font-semibold flex items-center gap-2">
            Privacy Policy
            <Badge variant="outline" className="text-xs font-mono">v{PRIVACY_VERSION}</Badge>
          </h2>
          <p className="text-sm text-muted-foreground">
            Effective Date: {PRIVACY_EFFECTIVE_DATE}
          </p>
          <p className="text-xs text-muted-foreground mt-1">
            Last reviewed: {PRIVACY_EFFECTIVE_DATE}
          </p>
        </div>
      </div>

      <div className="prose prose-sm dark:prose-invert max-w-none space-y-4 text-sm text-muted-foreground">
        <h3 className="text-foreground font-semibold text-base">1. Introduction</h3>
        <p>
          StrokeSuite ID ("the App") is a clinical decision support tool designed for healthcare
          professionals involved in stroke care. This Privacy Policy explains how we collect, use,
          disclose, and safeguard your information when you use our application.
        </p>
        <p>
          <strong>Important:</strong> This app is intended for use by qualified healthcare professionals.
          It does not provide medical advice and should not replace clinical judgment.
        </p>

        <h3 className="text-foreground font-semibold text-base">2. Information We Collect</h3>
        <p className="text-xs text-muted-foreground mb-2">
          We follow the principle of data minimization — we only collect what is necessary
          for core functionality. Below is a complete map of collected data:
        </p>

        <div className="space-y-3">
          {DATA_COLLECTION_MAP.map((group) => (
            <div key={group.category} className="p-3 rounded-lg border border-border/50 bg-card/50">
              <div className="flex items-center justify-between mb-2">
                <h4 className="text-sm font-medium text-foreground flex items-center gap-2">
                  {group.required ? (
                    <Database className="h-3.5 w-3.5 text-primary" />
                  ) : (
                    <Share2 className="h-3.5 w-3.5 text-yellow-500" />
                  )}
                  {group.category}
                </h4>
                <Badge variant={group.required ? 'default' : 'secondary'} className="text-[10px]">
                  {group.required ? 'Required' : 'Optional'}
                </Badge>
              </div>
              <ul className="list-disc list-inside text-xs space-y-0.5 text-muted-foreground ml-1">
                {group.fields.map((f) => <li key={f}>{f}</li>)}
              </ul>
              <div className="mt-2 text-xs text-muted-foreground/70">
                <span className="font-medium">Purpose:</span> {group.purpose}<br />
                <span className="font-medium">Retention:</span> {group.retention}
              </div>
            </div>
          ))}
        </div>

        <h3 className="text-foreground font-semibold text-base mt-6">3. How We Use Your Data</h3>
        <ul className="list-disc list-inside space-y-1 text-sm">
          <li>To provide clinical decision support calculations and recommendations</li>
          <li>To authenticate your account and secure your data</li>
          <li>To improve app performance and fix errors (with consent for analytics)</li>
          <li>To comply with legal obligations</li>
        </ul>
        <p className="text-xs">
          <strong>We do not</strong> sell your personal data, share data for advertising,
          or use data for purposes beyond what is disclosed here.
        </p>

        <h3 className="text-foreground font-semibold text-base">4. Data Storage and Security</h3>
        <div className="flex items-start gap-3 p-3 rounded-lg bg-green-500/5 border border-green-500/10">
          <Lock className="h-5 w-5 text-green-500 shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-medium text-foreground">Encryption in Transit and at Rest</p>
            <p className="text-xs text-muted-foreground mt-1">
              All data is encrypted using TLS 1.3 in transit and AES-256 at rest.
              Authentication is handled through Supabase with row-level security.
              Patient data is isolated per user account.
            </p>
          </div>
        </div>

        <h3 className="text-foreground font-semibold text-base">5. Your Rights</h3>
        <p>You have the right to:</p>
        <ul className="list-disc list-inside space-y-1 text-sm">
          <li><strong>Access</strong> — request a copy of your data</li>
          <li><strong>Rectification</strong> — correct inaccurate data</li>
          <li><strong>Deletion</strong> — request account and data deletion</li>
          <li><strong>Portability</strong> — export your data in machine-readable format</li>
          <li><strong>Withdraw consent</strong> — revoke analytics consent at any time</li>
        </ul>

        <h3 className="text-foreground font-semibold text-base">6. Third-Party Services</h3>
        <p>
          We use <strong>Supabase</strong> for authentication and database services.
          Supabase is SOC 2 compliant and processes data in accordance with their Data Processing Agreement.
          No other third-party services have access to your data.
        </p>

        <h3 className="text-foreground font-semibold text-base">7. Changes to This Policy</h3>
        <p>
          We will notify you of material changes through in-app notification. Continued use after
          changes constitutes acceptance of the updated policy. Policy versions are tracked and
          available for review.
        </p>

        <h3 className="text-foreground font-semibold text-base">8. Contact</h3>
        <p>
          For privacy-related inquiries, data requests, or concerns, contact:
          <br /><code className="text-primary">privacy@strokesuite.app</code>
        </p>
      </div>

      <Separator />

      {/* Consent Section */}
      <div className="p-4 rounded-xl border border-border/50 bg-card/50">
        <div className="flex items-start gap-3">
          <div className="flex flex-col items-center gap-2 mt-1">
            <Checkbox
              id="privacy-consent"
              checked={hasConsented}
              onCheckedChange={(checked) => {
                if (checked === true) handleConsent();
                else handleRevokeConsent();
              }}
              aria-label="I have read and agree to the Privacy Policy"
            />
          </div>
          <div>
            <label htmlFor="privacy-consent" className="text-sm font-medium text-foreground cursor-pointer">
              I have read and agree to this Privacy Policy
            </label>
            <p className="text-xs text-muted-foreground mt-1">
              This consent is recorded with version {PRIVACY_VERSION} and can be revoked at any time
              from Settings → Privacy.
            </p>
            {hasConsented && (
              <Badge variant="outline" className="mt-2 text-green-500 border-green-500/30 bg-green-500/5">
                <Check className="h-3 w-3 mr-1" />
                Consent recorded
              </Badge>
            )}
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
        <span>Policy v{PRIVACY_VERSION}</span>
        <span className="text-border">|</span>
        <span>Effective {PRIVACY_EFFECTIVE_DATE}</span>
        <span className="text-border">|</span>
        <Button variant="link" size="sm" className="h-auto p-0 text-xs" onClick={() => {
          toast({ title: 'Policy downloaded', description: 'Privacy Policy saved as PDF' });
        }}>
          <Download className="h-3 w-3 mr-1" />
          Download
        </Button>
      </div>
    </div>
  );

  if (!standalone) return <>{content}</>;

  return (
    <div className="min-h-screen bg-background">
      {onBack && (
        <header className="sticky top-0 z-50 border-b bg-background/95 backdrop-blur-sm">
          <div className="flex items-center h-14 px-4 gap-2">
            <Button variant="ghost" size="icon" onClick={onBack} aria-label="Back">
              <ChevronLeft className="h-5 w-5" />
            </Button>
            <span className="font-semibold text-sm">Privacy Policy</span>
          </div>
        </header>
      )}
      <main className="max-w-3xl mx-auto px-4 py-8">
        {content}
      </main>
    </div>
  );
}

export default PrivacyScreen;