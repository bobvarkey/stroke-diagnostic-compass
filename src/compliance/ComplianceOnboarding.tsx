// ══════════════════════════════════════════════════════════════════
// Compliance Onboarding Flow — StrokeSuite
// First-launch consent collection and policy acknowledgment.
// ══════════════════════════════════════════════════════════════════

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Brain, Shield, FileText, Gavel, AlertTriangle, Check, ArrowRight, Stethoscope, Eye } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { PrivacyScreen } from './PrivacyScreen';
import { TermsScreen } from './TermsScreen';
import { DisclaimerScreen } from './DisclaimerScreen';
import { consentService } from '@/services/consentService';
import { PRIVACY_VERSION, PRIVACY_EFFECTIVE_DATE } from './PrivacyScreen';
import { TERMS_VERSION, TERMS_EFFECTIVE_DATE } from './TermsScreen';
import { DISCLAIMER_VERSION, DISCLAIMER_EFFECTIVE_DATE } from './DisclaimerScreen';

interface ComplianceOnboardingProps {
  userId: string | null;
  onComplete: () => void;
  onSkipToApp?: () => void;
}

type OnboardingStep = 'welcome' | 'privacy' | 'terms' | 'disclaimer' | 'review';

export function ComplianceOnboarding({ userId, onComplete, onSkipToApp }: ComplianceOnboardingProps) {
  const { toast } = useToast();
  const [step, setStep] = useState<OnboardingStep>('welcome');
  const [accepted, setAccepted] = useState({
    privacy: false,
    terms: false,
    disclaimer: false,
  });

  const allAccepted = accepted.privacy && accepted.terms && accepted.disclaimer;

  const handleAccept = () => {
    consentService.recordConsent(userId, 'privacy', PRIVACY_VERSION, true, 'button');
    consentService.recordConsent(userId, 'terms', TERMS_VERSION, true, 'button');
    consentService.recordConsent(userId, 'disclaimer', DISCLAIMER_VERSION, true, 'button');
    try {
      localStorage.setItem('stroke_onboarding_complete', 'true');
      localStorage.setItem('stroke_onboarding_complete_date', new Date().toISOString());
    } catch { /* noop */ }
    toast({
      title: 'All policies accepted',
      description: 'You can review or revoke consent anytime in Settings',
    });
    onComplete();
  };

  if (step === 'privacy') {
    return (
      <div className="min-h-screen bg-background">
        <header className="sticky top-0 z-50 border-b bg-background/95 backdrop-blur-sm">
          <div className="flex items-center h-14 px-4">
            <span className="font-semibold text-sm">Privacy Policy</span>
            <Badge variant="outline" className="ml-2 text-xs">v{PRIVACY_VERSION}</Badge>
            <div className="flex-1" />
            <Badge variant="secondary" className="text-xs">Step 2 of 4</Badge>
          </div>
        </header>
        <div className="max-w-3xl mx-auto px-4 py-8">
          <PrivacyScreen />
          <Separator className="my-6" />
          <div className="space-y-3">
            <div className="flex items-start gap-3">
              <Checkbox
                id="onboarding-privacy"
                checked={accepted.privacy}
                onCheckedChange={(c) => setAccepted((a) => ({ ...a, privacy: c === true }))}
                aria-label="I have read and accept the Privacy Policy"
              />
              <label htmlFor="onboarding-privacy" className="text-sm cursor-pointer">
                I have read and accept the Privacy Policy (v{PRIVACY_VERSION}, effective {PRIVACY_EFFECTIVE_DATE})
              </label>
            </div>
            <div className="flex justify-between">
              <Button variant="ghost" onClick={() => setStep('welcome')}>Back</Button>
              <Button onClick={() => setStep('terms')} disabled={!accepted.privacy}>
                Next: Terms of Use <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (step === 'terms') {
    return (
      <div className="min-h-screen bg-background">
        <header className="sticky top-0 z-50 border-b bg-background/95 backdrop-blur-sm">
          <div className="flex items-center h-14 px-4">
            <span className="font-semibold text-sm">Terms of Use</span>
            <Badge variant="outline" className="ml-2 text-xs">v{TERMS_VERSION}</Badge>
            <div className="flex-1" />
            <Badge variant="secondary" className="text-xs">Step 3 of 4</Badge>
          </div>
        </header>
        <div className="max-w-3xl mx-auto px-4 py-8">
          <TermsScreen />
          <Separator className="my-6" />
          <div className="space-y-3">
            <div className="flex items-start gap-3">
              <Checkbox
                id="onboarding-terms"
                checked={accepted.terms}
                onCheckedChange={(c) => setAccepted((a) => ({ ...a, terms: c === true }))}
                aria-label="I have read and accept the Terms of Use"
              />
              <label htmlFor="onboarding-terms" className="text-sm cursor-pointer">
                I have read and accept the Terms of Use (v{TERMS_VERSION}, effective {TERMS_EFFECTIVE_DATE})
              </label>
            </div>
            <div className="flex justify-between">
              <Button variant="ghost" onClick={() => setStep('privacy')}>Back</Button>
              <Button onClick={() => setStep('disclaimer')} disabled={!accepted.terms}>
                Next: Disclaimer <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (step === 'disclaimer') {
    return (
      <div className="min-h-screen bg-background">
        <header className="sticky top-0 z-50 border-b bg-background/95 backdrop-blur-sm">
          <div className="flex items-center h-14 px-4">
            <span className="font-semibold text-sm">Disclaimer</span>
            <Badge variant="outline" className="ml-2 text-xs">v{DISCLAIMER_VERSION}</Badge>
            <div className="flex-1" />
            <Badge variant="secondary" className="text-xs">Step 4 of 4</Badge>
          </div>
        </header>
        <div className="max-w-3xl mx-auto px-4 py-8">
          <DisclaimerScreen showAcknowledgement />
          <Separator className="my-6" />
          <div className="space-y-3">
            <div className="flex items-start gap-3">
              <Checkbox
                id="onboarding-disclaimer"
                checked={accepted.disclaimer}
                onCheckedChange={(c) => setAccepted((a) => ({ ...a, disclaimer: c === true }))}
                aria-label="I acknowledge the disclaimers"
              />
              <label htmlFor="onboarding-disclaimer" className="text-sm cursor-pointer">
                I acknowledge the disclaimers (v{DISCLAIMER_VERSION}, effective {DISCLAIMER_EFFECTIVE_DATE})
              </label>
            </div>
            <div className="flex justify-between">
              <Button variant="ghost" onClick={() => setStep('terms')}>Back</Button>
              <Button onClick={() => setStep('review')} disabled={!accepted.disclaimer}>
                Review & Complete <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (step === 'review') {
    return (
      <div className="min-h-screen bg-background">
        <header className="sticky top-0 z-50 border-b bg-background/95 backdrop-blur-sm">
          <div className="flex items-center h-14 px-4">
            <span className="font-semibold text-sm">Review & Complete</span>
          </div>
        </header>
        <div className="max-w-3xl mx-auto px-4 py-12">
          <div className="text-center space-y-6">
            <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-primary to-accent-purple flex items-center justify-center mx-auto shadow-lg">
              <Shield className="h-10 w-10 text-white" />
            </div>
            <h1 className="text-2xl font-bold">Almost there!</h1>
            <p className="text-muted-foreground">
              You've reviewed all our policies. Here's a summary:
            </p>
            <div className="max-w-md mx-auto space-y-3 text-left">
              {[
                { label: 'Privacy Policy', version: `v${PRIVACY_VERSION}`, accepted: accepted.privacy },
                { label: 'Terms of Use', version: `v${TERMS_VERSION}`, accepted: accepted.terms },
                { label: 'Medical Disclaimer', version: `v${DISCLAIMER_VERSION}`, accepted: accepted.disclaimer },
              ].map((item) => (
                <div key={item.label} className="flex items-center justify-between p-3 rounded-lg border border-border/50 bg-card/50">
                  <div>
                    <span className="text-sm font-medium">{item.label}</span>
                    <Badge variant="outline" className="ml-2 text-xs">{item.version}</Badge>
                  </div>
                  {item.accepted ? (
                    <Check className="h-5 w-5 text-green-500" />
                  ) : (
                    <div className="h-5 w-5 rounded-full border-2 border-red-500" />
                  )}
                </div>
              ))}
            </div>
            <div className="space-y-3">
              <Button
                size="lg"
                className="w-full max-w-md"
                disabled={!allAccepted}
                onClick={handleAccept}
              >
                <Check className="h-5 w-5 mr-2" />
                Accept All & Continue
              </Button>
              {onSkipToApp && (
                <Button variant="ghost" size="sm" onClick={onSkipToApp}>
                  Skip for now (demo mode)
                </Button>
              )}
            </div>
            <p className="text-xs text-muted-foreground">
              You can review and update your preferences anytime in Settings → Privacy & Consent
            </p>
          </div>
        </div>
      </div>
    );
  }

  // Welcome step
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-indigo-950 flex items-center justify-center p-4 relative overflow-hidden">
      <div className="absolute w-[500px] h-[500px] rounded-full bg-primary/20 blur-[120px] -top-40 -right-40 animate-glow" />
      <div className="absolute w-[400px] h-[400px] rounded-full bg-accent-purple/20 blur-[100px] -bottom-32 -left-32 animate-glow" style={{ animationDelay: '1.5s' }} />
      <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-[size:50px_50px]" />

      <div className="relative w-full max-w-lg space-y-8">
        <div className="flex flex-col items-center text-center">
          <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-primary to-accent-purple flex items-center justify-center mb-6 shadow-lg shadow-primary/30">
            <Brain className="h-10 w-10 text-white" />
          </div>
          <h1 className="text-3xl font-black tracking-wider text-white uppercase">
            Stroke<span className="text-primary">Suite</span> ID
          </h1>
          <p className="text-slate-500 text-sm tracking-[0.3em] uppercase mt-2">
            Clinical Decision Support
          </p>
        </div>

        <div className="glass-strong rounded-2xl p-6 space-y-6">
          <div className="space-y-3">
            <h2 className="text-lg font-semibold text-white">Before you begin</h2>
            <p className="text-sm text-slate-400">
              To use StrokeSuite ID, you need to review and accept a few documents.
              This helps us comply with privacy regulations and ensures you understand
              the scope and limitations of this clinical tool.
            </p>
          </div>

          <div className="space-y-3">
            {[
              { icon: Eye, label: 'Privacy Policy', desc: 'How we collect and protect your data', color: 'text-primary' },
              { icon: Gavel, label: 'Terms of Use', desc: 'Your rights and responsibilities', color: 'text-accent-purple' },
              { icon: AlertTriangle, label: 'Medical Disclaimer', desc: 'Important limitations of this tool', color: 'text-accent-amber' },
            ].map(({ icon: Icon, label, desc, color }) => (
              <div key={label} className="flex items-center gap-3 p-3 rounded-lg bg-white/5">
                <Icon className={`h-5 w-5 ${color} shrink-0`} />
                <div>
                  <p className="text-sm font-medium text-white">{label}</p>
                  <p className="text-xs text-slate-500">{desc}</p>
                </div>
              </div>
            ))}
          </div>

          <Button
            className="w-full h-12 bg-gradient-to-r from-primary to-accent-purple hover:opacity-90 text-white font-bold text-base rounded-xl"
            onClick={() => setStep('privacy')}
          >
            Begin Setup <ArrowRight className="h-5 w-5 ml-2" />
          </Button>

          {onSkipToApp && (
            <div className="text-center">
              <Button variant="ghost" size="sm" onClick={onSkipToApp} className="text-slate-500 hover:text-slate-300">
                Skip — Demo Mode
              </Button>
            </div>
          )}
        </div>

        <div className="text-center">
          <p className="text-slate-700 text-xs">
            StrokeSuite™ Clinical Decision Support System
          </p>
        </div>
      </div>
    </div>
  );
}

export default ComplianceOnboarding;