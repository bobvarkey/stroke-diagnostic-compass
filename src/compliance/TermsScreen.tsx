// ══════════════════════════════════════════════════════════════════
// Terms of Use Screen — StrokeSuite
// Versioned, consent-tracked, with legal disclaimers.
// ══════════════════════════════════════════════════════════════════

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Checkbox } from '@/components/ui/checkbox';
import { ScrollArea } from '@/components/ui/scroll-area';
import { FileText, ChevronLeft, Check, Gavel, Scale, AlertTriangle, UserCheck, Ban } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';

export const TERMS_VERSION = '1.0.0';
export const TERMS_EFFECTIVE_DATE = '2026-06-03';

const getConsentKey = (userId: string | null) => `stroke_terms_consent_${userId || 'anonymous'}_${TERMS_VERSION}`;
const getConsentStatus = (userId: string | null): boolean | null => {
  if (!userId) return null;
  try { return localStorage.getItem(getConsentKey(userId)) === 'true'; } catch { return null; }
};
const setConsentStatus = (userId: string | null, consented: boolean) => {
  if (!userId) return;
  try {
    localStorage.setItem(getConsentKey(userId), String(consented));
    localStorage.setItem(`stroke_terms_consent_date_${userId}`, new Date().toISOString());
  } catch { /* noop */ }
};

interface TermsScreenProps {
  onBack?: () => void;
  standalone?: boolean;
}

export function TermsScreen({ onBack, standalone = false }: TermsScreenProps) {
  const { user } = useAuth();
  const { toast } = useToast();
  const [hasConsented, setHasConsented] = useState(false);

  useEffect(() => {
    const status = getConsentStatus(user?.id || null);
    if (status !== null) setHasConsented(status);
  }, [user]);

  const handleConsent = () => {
    setConsentStatus(user?.id || null, true);
    setHasConsented(true);
    toast({ title: 'Terms accepted', description: `Version ${TERMS_VERSION}` });
  };

  const handleRevoke = () => {
    setConsentStatus(user?.id || null, false);
    setHasConsented(false);
    toast({ title: 'Terms acceptance revoked', variant: 'destructive' });
  };

  const content = (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start gap-4 p-4 rounded-xl bg-primary/5 border border-primary/10">
        <Gavel className="h-8 w-8 text-primary shrink-0 mt-1" />
        <div>
          <h2 className="text-lg font-semibold flex items-center gap-2">
            Terms of Use
            <Badge variant="outline" className="text-xs font-mono">v{TERMS_VERSION}</Badge>
          </h2>
          <p className="text-sm text-muted-foreground">
            Effective Date: {TERMS_EFFECTIVE_DATE}
          </p>
        </div>
      </div>

      <div className="prose prose-sm dark:prose-invert max-w-none space-y-4 text-sm text-muted-foreground">
        <h3 className="text-foreground font-semibold text-base">1. Acceptance of Terms</h3>
        <p>
          By accessing or using StrokeSuite ID ("the App"), you agree to be bound by these Terms of Use.
          If you do not agree, do not use the App. These terms constitute a legally binding agreement
          between you and the App operator.
        </p>

        <h3 className="text-foreground font-semibold text-base">2. Eligibility and User Responsibilities</h3>
        <div className="flex items-start gap-3 p-3 rounded-lg bg-blue-500/5 border border-blue-500/10">
          <UserCheck className="h-5 w-5 text-blue-500 shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-medium text-foreground">You must be a qualified healthcare professional</p>
            <p className="text-xs text-muted-foreground mt-1">
              This app is designed for physicians, nurses, and allied health professionals involved
              in stroke care. By using the app, you represent that you are a licensed or qualified
              healthcare professional.
            </p>
          </div>
        </div>
        <ul className="list-disc list-inside space-y-1">
          <li>You are responsible for maintaining the confidentiality of your account credentials</li>
          <li>You agree not to share your account with unauthorized users</li>
          <li>You are responsible for all activity under your account</li>
          <li>You must comply with all applicable laws and regulations</li>
        </ul>

        <h3 className="text-foreground font-semibold text-base">3. No Medical Advice Disclaimer</h3>
        <div className="flex items-start gap-3 p-3 rounded-lg bg-amber-500/5 border border-amber-500/10">
          <AlertTriangle className="h-5 w-5 text-amber-500 shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-medium text-foreground">This app does NOT provide medical advice</p>
            <p className="text-xs text-muted-foreground mt-1">
              StrokeSuite ID is a clinical decision support tool that provides reference information
              and calculations. It is NOT a substitute for professional medical judgment, diagnosis,
              or treatment. Always verify recommendations against current clinical guidelines and
              use your independent clinical judgment.
            </p>
          </div>
        </div>

        <h3 className="text-foreground font-semibold text-base">4. Intellectual Property</h3>
        <p>
          All content, algorithms, visual designs, and code are the intellectual property of
          StrokeSuite ID unless otherwise attributed. You may not copy, modify, distribute,
          reverse engineer, or create derivative works without explicit written permission.
        </p>

        <h3 className="text-foreground font-semibold text-base">5. Acceptable Use</h3>
        <p>You agree not to:</p>
        <ul className="list-disc list-inside space-y-1">
          <li>Use the app for any unlawful purpose</li>
          <li>Attempt to compromise the security or integrity of the app</li>
          <li>Upload malicious code or attempt to disrupt service</li>
          <li>Scrape, crawl, or extract data beyond normal usage</li>
          <li>Use the app to make automated clinical decisions without human review</li>
          <li>Misrepresent the app's capabilities or claim it provides medical diagnoses</li>
        </ul>

        <h3 className="text-foreground font-semibold text-base">6. Limitation of Liability</h3>
        <div className="flex items-start gap-3 p-3 rounded-lg bg-red-500/5 border border-red-500/10">
          <Ban className="h-5 w-5 text-red-500 shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-medium text-foreground">Disclaimer of Warranties</p>
            <p className="text-xs text-muted-foreground mt-1">
              The app is provided "as is" without warranty of any kind. The operators shall not be liable
              for any damages arising from use or inability to use the app, including but not limited to
              clinical decisions made using information from the app.
            </p>
          </div>
        </div>

        <h3 className="text-foreground font-semibold text-base">7. Account Termination</h3>
        <p>
          We reserve the right to suspend or terminate accounts that violate these terms.
          You may terminate your account at any time through Settings → Delete Account.
          Upon termination, your data will be deleted in accordance with our Privacy Policy.
        </p>

        <h3 className="text-foreground font-semibold text-base">8. Changes to Terms</h3>
        <p>
          We may update these terms. Material changes will be communicated through in-app notification.
          Continued use after changes constitutes acceptance. Previous versions are available upon request.
        </p>

        <h3 className="text-foreground font-semibold text-base">9. Governing Law</h3>
        <p>
          These terms are governed by the laws of the Republic of India. Any disputes shall be
          subject to the exclusive jurisdiction of the courts in Kochi, Kerala, India.
        </p>

        <h3 className="text-foreground font-semibold text-base">10. Contact</h3>
        <p>
          For questions about these terms:<br />
          <code className="text-primary">legal@strokesuite.app</code>
        </p>
      </div>

      <Separator />

      {/* Consent */}
      <div className="p-4 rounded-xl border border-border/50 bg-card/50">
        <div className="flex items-start gap-3">
          <Checkbox
            id="terms-consent"
            checked={hasConsented}
            onCheckedChange={(checked) => {
              if (checked === true) handleConsent();
              else handleRevoke();
            }}
            aria-label="I have read and agree to the Terms of Use"
          />
          <div>
            <label htmlFor="terms-consent" className="text-sm font-medium text-foreground cursor-pointer">
              I have read and agree to the Terms of Use
            </label>
            <p className="text-xs text-muted-foreground mt-1">
              Version {TERMS_VERSION}. Can be reviewed or revoked in Settings.
            </p>
            {hasConsented && (
              <Badge variant="outline" className="mt-2 text-green-500 border-green-500/30 bg-green-500/5">
                <Check className="h-3 w-3 mr-1" />
                Accepted
              </Badge>
            )}
          </div>
        </div>
      </div>

      <div className="flex items-center gap-2 text-xs text-muted-foreground">
        <span>v{TERMS_VERSION}</span>
        <span className="text-border">|</span>
        <span>Effective {TERMS_EFFECTIVE_DATE}</span>
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
            <span className="font-semibold text-sm">Terms of Use</span>
          </div>
        </header>
      )}
      <main className="max-w-3xl mx-auto px-4 py-8">
        {content}
      </main>
    </div>
  );
}

export default TermsScreen;