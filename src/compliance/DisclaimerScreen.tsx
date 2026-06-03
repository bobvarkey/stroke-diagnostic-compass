// ══════════════════════════════════════════════════════════════════
// Disclaimer Screen — StrokeSuite
// General disclaimer, medical disclaimer, and clinical limitations.
// ══════════════════════════════════════════════════════════════════

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import { AlertTriangle, ChevronLeft, Info, ShieldAlert, BookOpen, Stethoscope, Scale, FileWarning } from 'lucide-react';
import { Checkbox } from '@/components/ui/checkbox';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';

export const DISCLAIMER_VERSION = '1.0.0';
export const DISCLAIMER_EFFECTIVE_DATE = '2026-06-03';

interface DisclaimerScreenProps {
  onBack?: () => void;
  standalone?: boolean;
  showAcknowledgement?: boolean;  // Show "I acknowledge" checkbox
  onAcknowledge?: () => void;     // Called when user acknowledges
}

export function DisclaimerScreen({ onBack, standalone = false, showAcknowledgement = false, onAcknowledge }: DisclaimerScreenProps) {
  const { user } = useAuth();
  const { toast } = useToast();
  const [acknowledged, setAcknowledged] = useState(false);

  const handleAcknowledge = () => {
    try {
      if (user?.id) {
        localStorage.setItem(`stroke_disclaimer_ack_${user.id}_${DISCLAIMER_VERSION}`, 'true');
        localStorage.setItem(`stroke_disclaimer_ack_date_${user.id}`, new Date().toISOString());
      }
    } catch { /* noop */ }
    setAcknowledged(true);
    toast({ title: 'Disclaimer acknowledged', description: `Version ${DISCLAIMER_VERSION}` });
    onAcknowledge?.();
  };

  const content = (
    <div className="space-y-6">
      {/* Critical Warning Banner */}
      <div className="flex items-start gap-4 p-4 rounded-xl bg-destructive/10 border border-destructive/30">
        <FileWarning className="h-8 w-8 text-destructive shrink-0 mt-1" />
        <div>
          <h2 className="text-lg font-semibold flex items-center gap-2 text-destructive">
            IMPORTANT DISCLAIMER
            <Badge variant="outline" className="text-xs font-mono border-destructive/30 text-destructive">
              v{DISCLAIMER_VERSION}
            </Badge>
          </h2>
          <p className="text-sm text-muted-foreground">
            Read carefully before using StrokeSuite ID. This disclaimer limits liability and
            defines the scope of the tool.
          </p>
        </div>
      </div>

      {/* Medical Disclaimer */}
      <div className="flex items-start gap-3 p-4 rounded-xl bg-amber-500/5 border border-amber-500/10">
        <Stethoscope className="h-6 w-6 text-amber-500 shrink-0 mt-0.5" />
        <div className="space-y-2">
          <h3 className="text-base font-semibold text-foreground">Medical Disclaimer</h3>
          <div className="text-sm text-muted-foreground space-y-3">
            <p>
              <strong>StrokeSuite ID is NOT a medical device.</strong> It has not been cleared or
              approved by the FDA, EMA, CDSCO, or any other regulatory body. It is a clinical
              reference and educational tool — NOT a diagnostic or treatment device.
            </p>
            <p>
              <strong>No doctor-patient relationship.</strong> Use of this app does not create a
              doctor-patient relationship. All clinical decisions must be made by qualified
              healthcare professionals in consultation with the patient.
            </p>
            <p>
              <strong>Clinical judgment supersedes.</strong> The calculations, algorithms, and
              recommendations provided are for reference only. They may not apply to all patients,
              especially those with atypical presentations, comorbidities, or contraindications
              not captured by the tool.
            </p>
            <p>
              <strong>Guidelines may vary.</strong> The app references published guidelines
              (AHA/ASA, ESO, etc.) which may differ from local protocols. Always follow your
              institution's guidelines.
            </p>
          </div>
        </div>
      </div>

      {/* Accuracy Disclaimer */}
      <div className="flex items-start gap-3 p-4 rounded-xl bg-blue-500/5 border border-blue-500/10">
        <Scale className="h-6 w-6 text-blue-500 shrink-0 mt-0.5" />
        <div className="space-y-2">
          <h3 className="text-base font-semibold text-foreground">Accuracy and Limitations</h3>
          <div className="text-sm text-muted-foreground space-y-3">
            <p>
              While we strive for accuracy, algorithms may contain errors or become outdated as new
              evidence emerges. Always cross-reference against primary literature and current guidelines.
            </p>
            <p>
              Scores and risk calculations are validated against published studies but may have
              limited accuracy in specific populations. Calculators should be used as guides,
              not definitive predictors.
            </p>
            <ul className="list-disc list-inside space-y-1">
              <li>Scores are derived from published literature (cited in-app)</li>
              <li>Actual outcomes may differ from predictions</li>
              <li>No guarantee of accuracy, completeness, or timeliness</li>
              <li>Users should verify calculations independently</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Liability Disclaimer */}
      <div className="flex items-start gap-3 p-4 rounded-xl bg-red-500/5 border border-red-500/10">
        <ShieldAlert className="h-6 w-6 text-red-500 shrink-0 mt-0.5" />
        <div className="space-y-2">
          <h3 className="text-base font-semibold text-foreground">Limitation of Liability</h3>
          <div className="text-sm text-muted-foreground space-y-3">
            <p>
              To the maximum extent permitted by law, the developers, operators, and contributors
              of StrokeSuite ID shall not be liable for any direct, indirect, incidental, special,
              consequential, or exemplary damages arising from:
            </p>
            <ul className="list-disc list-inside space-y-1">
              <li>Use or inability to use the app</li>
              <li>Clinical decisions made based on app output</li>
              <li>Errors, omissions, or inaccuracies in content</li>
              <li>Data loss or unauthorized access</li>
              <li>Any claims by third parties</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Content Governance */}
      <div className="flex items-start gap-3 p-4 rounded-xl bg-purple-500/5 border border-purple-500/10">
        <BookOpen className="h-6 w-6 text-purple-500 shrink-0 mt-0.5" />
        <div className="space-y-2">
          <h3 className="text-base font-semibold text-foreground">Content Governance</h3>
          <div className="text-sm text-muted-foreground space-y-3">
            <p>
              All clinical content is reviewed before publication. Key governance rules:
            </p>
            <ul className="list-disc list-inside space-y-1">
              <li>No unsupported claims (e.g., "guaranteed," "perfect accuracy")</li>
              <li>All clinical recommendations cite published guidelines or literature</li>
              <li>Content is versioned with changelogs for auditability</li>
              <li>High-severity algorithm errors trigger immediate content freeze</li>
              <li>User feedback is reviewed quarterly for content updates</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Other Disclaimers */}
      <div className="text-sm text-muted-foreground space-y-3">
        <h3 className="text-foreground font-semibold text-base">General Disclaimers</h3>
        <p>
          <strong>No Warranty:</strong> The app is provided "AS IS" and "AS AVAILABLE" without
          warranties of any kind, either express or implied.
        </p>
        <p>
          <strong>No Endorsement:</strong> References to specific drugs, devices, or guidelines
          do not constitute endorsement.
        </p>
        <p>
          <strong>Third-Party Content:</strong> Some content references third-party sources.
          We are not responsible for the accuracy of external content.
        </p>
        <p>
          <strong>Offline Use:</strong> Offline calculations use cached data and may not reflect
          the latest updates. Connect to the internet periodically for updates.
        </p>
        <p>
          <strong>Data Accuracy:</strong> You are responsible for the accuracy of data you enter.
          The app does not validate input for clinical correctness.
        </p>
      </div>

      {/* Acknowledgment */}
      {showAcknowledgement && (
        <>
          <Separator />
          <div className="p-4 rounded-xl border border-border/50 bg-card/50">
            <div className="flex items-start gap-3">
              <Checkbox
                id="disclaimer-ack"
                checked={acknowledged}
                onCheckedChange={() => {
                  if (!acknowledged) handleAcknowledge();
                }}
                aria-label="I acknowledge the above disclaimers and limitations"
              />
              <div>
                <label htmlFor="disclaimer-ack" className="text-sm font-medium text-foreground cursor-pointer">
                  I acknowledge and accept the above disclaimers and limitations
                </label>
                <p className="text-xs text-muted-foreground mt-1">
                  This acknowledgment is recorded with version {DISCLAIMER_VERSION}.
                </p>
                {acknowledged && (
                  <Badge variant="outline" className="mt-2 text-green-500 border-green-500/30 bg-green-500/5">
                    Acknowledged
                  </Badge>
                )}
              </div>
            </div>
          </div>
        </>
      )}

      <div className="flex items-center gap-2 text-xs text-muted-foreground">
        <span>v{DISCLAIMER_VERSION}</span>
        <span className="text-border">|</span>
        <span>Effective {DISCLAIMER_EFFECTIVE_DATE}</span>
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
            <span className="font-semibold text-sm">Disclaimer</span>
          </div>
        </header>
      )}
      <main className="max-w-3xl mx-auto px-4 py-8">
        {content}
      </main>
    </div>
  );
}

export default DisclaimerScreen;