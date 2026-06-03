// ══════════════════════════════════════════════════════════════════
// Settings Screen — StrokeSuite
// Legal links, consent management, account closure, data export.
// ══════════════════════════════════════════════════════════════════

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from '@/components/ui/dialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import {
  ChevronLeft,
  Shield,
  FileText,
  Gavel,
  AlertTriangle,
  Download,
  Trash2,
  UserX,
  Database,
  Eye,
  CheckCircle,
  XCircle,
  Lock,
  Server,
  Smartphone,
  RefreshCw,
} from 'lucide-react';

import { PrivacyScreen, PRIVACY_VERSION as PV } from './PrivacyScreen';
import { TermsScreen, TERMS_VERSION as TV } from './TermsScreen';
import { DisclaimerScreen, DISCLAIMER_VERSION as DV } from './DisclaimerScreen';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';

type LegalView = 'privacy' | 'terms' | 'disclaimer' | null;

// Mock — in production this would call backend APIs
const mockRequestDataExport = async (userId: string): Promise<string> => {
  await new Promise((r) => setTimeout(r, 500));
  return JSON.stringify({
    user: { id: userId },
    profile: { /* ... */ },
    patients: [],
    consents: [],
    auditLogs: [],
    exportedAt: new Date().toISOString(),
  }, null, 2);
};

const mockDeleteAccount = async (userId: string): Promise<void> => {
  await new Promise((r) => setTimeout(r, 1000));
};

export function SettingsScreen({ onBack }: { onBack: () => void }) {
  const { user, profile, isAdmin, signOut } = useAuth();
  const { toast } = useToast();
  const [legalView, setLegalView] = useState<LegalView>(null);
  const [analyticsConsent, setAnalyticsConsent] = useState(() => {
    try {
      return localStorage.getItem('stroke_analytics_consent') === 'true';
    } catch { return false; }
  });
  const [exporting, setExporting] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState('');
  const [showExportDialog, setShowExportDialog] = useState(false);
  const [appCacheInfo, setAppCacheInfo] = useState({
    cachedAlgorithms: 36,
    cachedAssets: 15,
    lastSync: 'Today, 10:32 AM',
    cacheSize: '~4.2 MB',
  });

  const handleAnalyticsToggle = (enabled: boolean) => {
    try {
      localStorage.setItem('stroke_analytics_consent', String(enabled));
    } catch { /* noop */ }
    setAnalyticsConsent(enabled);
    toast({
      title: enabled ? 'Analytics enabled' : 'Analytics disabled',
      description: enabled
        ? 'Anonymous usage data helps us improve the app'
        : 'No usage data will be collected',
    });
  };

  const handleExport = async () => {
    if (!user) return;
    setExporting(true);
    try {
      const data = await mockRequestDataExport(user.id);
      const blob = new Blob([data], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `strokesuite-data-export-${user.id.slice(0, 8)}.json`;
      a.click();
      URL.revokeObjectURL(url);
      toast({ title: 'Data exported', description: 'Download started' });
      setShowExportDialog(false);
    } catch {
      toast({ title: 'Export failed', description: 'Please try again', variant: 'destructive' });
    } finally {
      setExporting(false);
    }
  };

  const handleDeleteAccount = async () => {
    if (!user || deleteConfirm !== user.email?.split('@')[0]) return;
    setDeleting(true);
    try {
      await mockDeleteAccount(user.id);
      toast({ title: 'Account deletion initiated', description: 'Your data will be purged within 30 days' });
      await signOut();
    } catch {
      toast({ title: 'Deletion failed', description: 'Please contact support', variant: 'destructive' });
    } finally {
      setDeleting(false);
    }
  };

  const consentStatus = (key: string): 'granted' | 'not_granted' => {
    try { return localStorage.getItem(key) === 'true' ? 'granted' : 'not_granted'; } catch { return 'not_granted'; }
  };

  // If viewing a legal document inline
  if (legalView === 'privacy') return <PrivacyScreen onBack={() => setLegalView(null)} standalone />;
  if (legalView === 'terms') return <TermsScreen onBack={() => setLegalView(null)} standalone />;
  if (legalView === 'disclaimer') return <DisclaimerScreen onBack={() => setLegalView(null)} standalone />;

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-50 border-b bg-background/95 backdrop-blur-sm">
        <div className="flex items-center h-14 px-4 gap-2">
          <Button variant="ghost" size="icon" onClick={onBack} aria-label="Back to app">
            <ChevronLeft className="h-5 w-5" />
          </Button>
          <span className="font-semibold text-sm">Settings</span>
          {isAdmin && (
            <Badge variant="secondary" className="ml-auto text-xs">
              Admin
            </Badge>
          )}
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-4 py-6 space-y-8">
        {/* Profile */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <Eye className="h-4 w-4 text-primary" />
              Account
            </CardTitle>
            <CardDescription>
              Signed in as {profile?.display_name || profile?.username || user?.email}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="text-xs text-muted-foreground space-y-1">
              <p>User ID: <code className="text-primary">{user?.id?.slice(0, 12)}...</code></p>
              <p>Account created: {/* Would come from profile */}</p>
            </div>
            <div className="flex flex-wrap gap-2">
              <Button variant="outline" size="sm" onClick={signOut}>
                <UserX className="h-4 w-4 mr-2" />
                Sign Out
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Privacy & Consent */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <Shield className="h-4 w-4 text-primary" />
              Privacy & Consent
            </CardTitle>
            <CardDescription>
              Manage your privacy preferences and data
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Consent Status */}
            <div className="space-y-2">
              <Label className="text-xs text-muted-foreground uppercase tracking-wider">
                Consent Status
              </Label>
              {[
                { label: 'Privacy Policy v' + PV, key: `stroke_privacy_consent_${user?.id}_${PV}` },
                { label: 'Terms of Use v' + TV, key: `stroke_terms_consent_${user?.id}_${TV}` },
                { label: 'Disclaimer v' + DV, key: `stroke_disclaimer_ack_${user?.id}_${DV}` },
                { label: 'Analytics Collection', key: 'stroke_analytics_consent' },
              ].map(({ label, key }) => (
                <div key={key} className="flex items-center justify-between py-1.5">
                  <span className="text-sm">{label}</span>
                  {consentStatus(key) === 'granted' || (key === 'stroke_analytics_consent' && analyticsConsent) ? (
                    <Badge variant="outline" className="text-green-500 border-green-500/30 bg-green-500/5">
                      <CheckCircle className="h-3 w-3 mr-1" /> Granted
                    </Badge>
                  ) : (
                    <Badge variant="outline" className="text-muted-foreground">
                      <XCircle className="h-3 w-3 mr-1" /> Not Granted
                    </Badge>
                  )}
                </div>
              ))}
            </div>

            <Separator />

            {/* Analytics Consent Toggle */}
            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="analytics-switch" className="text-sm font-medium">
                  Anonymous Analytics
                </Label>
                <p className="text-xs text-muted-foreground">
                  Help us improve with anonymous usage data
                </p>
              </div>
              <Switch
                id="analytics-switch"
                checked={analyticsConsent}
                onCheckedChange={handleAnalyticsToggle}
                aria-label="Toggle anonymous analytics collection"
              />
            </div>

            <Separator />

            {/* Legal Document Links */}
            <div className="space-y-1">
              <Label className="text-xs text-muted-foreground uppercase tracking-wider">
                Legal Documents
              </Label>
              <div className="space-y-1">
                <Button variant="ghost" size="sm" className="w-full justify-start" onClick={() => setLegalView('privacy')}>
                  <FileText className="h-4 w-4 mr-2 text-primary" />
                  Privacy Policy <Badge variant="outline" className="ml-auto text-xs">v{PV}</Badge>
                </Button>
                <Button variant="ghost" size="sm" className="w-full justify-start" onClick={() => setLegalView('terms')}>
                  <Gavel className="h-4 w-4 mr-2 text-primary" />
                  Terms of Use <Badge variant="outline" className="ml-auto text-xs">v{TV}</Badge>
                </Button>
                <Button variant="ghost" size="sm" className="w-full justify-start" onClick={() => setLegalView('disclaimer')}>
                  <AlertTriangle className="h-4 w-4 mr-2 text-amber-500" />
                  Disclaimers <Badge variant="outline" className="ml-auto text-xs">v{DV}</Badge>
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Data Management */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <Database className="h-4 w-4 text-primary" />
              Data Management
            </CardTitle>
            <CardDescription>
              Export or delete your data
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {/* Data Export Dialog */}
            <Dialog open={showExportDialog} onOpenChange={setShowExportDialog}>
              <DialogTrigger asChild>
                <Button variant="outline" className="w-full justify-start">
                  <Download className="h-4 w-4 mr-2" />
                  Export My Data
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Export Your Data</DialogTitle>
                  <DialogDescription>
                    You will receive a JSON file containing your account data, patient records,
                    consent history, and audit logs. This is for personal backup or portability.
                  </DialogDescription>
                </DialogHeader>
                <div className="text-sm text-muted-foreground space-y-2">
                  <p><strong>What's included:</strong></p>
                  <ul className="list-disc list-inside">
                    <li>Profile information</li>
                    <li>Patient records (clinical data)</li>
                    <li>Consent history</li>
                    <li>Audit logs (non-sensitive)</li>
                  </ul>
                  <p className="text-xs text-amber-400">
                    ⚠️ Export contains sensitive patient data. Handle securely.
                  </p>
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setShowExportDialog(false)}>
                    Cancel
                  </Button>
                  <Button onClick={handleExport} disabled={exporting}>
                    {exporting ? (
                      <><RefreshCw className="h-4 w-4 mr-2 animate-spin" /> Exporting...</>
                    ) : (
                      <><Download className="h-4 w-4 mr-2" /> Export</>
                    )}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>

            {/* Delete Account */}
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="outline" className="w-full justify-start text-destructive border-destructive/30 hover:bg-destructive/10">
                  <Trash2 className="h-4 w-4 mr-2" />
                  Delete Account & All Data
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle className="text-destructive">Delete Account</AlertDialogTitle>
                  <AlertDialogDescription>
                    This will permanently delete your account and all associated data.
                    This action cannot be undone. Patient data will be purged within 30 days.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <div className="space-y-3 py-2">
                  <div className="p-3 rounded-lg bg-destructive/10 border border-destructive/20">
                    <p className="text-sm font-medium text-destructive">
                      ⚠️ Irreversible action
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      All patient records, clinical data, and account information will be permanently deleted.
                      Export your data first if you need a copy.
                    </p>
                  </div>
                  <div className="space-y-1">
                    <Label htmlFor="delete-confirm" className="text-sm">
                      Type your username to confirm:
                      <code className="ml-2 text-primary">{user?.email?.split('@')[0]}</code>
                    </Label>
                    <Input
                      id="delete-confirm"
                      value={deleteConfirm}
                      onChange={(e) => setDeleteConfirm(e.target.value)}
                      placeholder="Type your username"
                      className="mt-1"
                    />
                  </div>
                </div>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction
                    onClick={handleDeleteAccount}
                    disabled={deleteConfirm !== user?.email?.split('@')[0] || deleting}
                    className="bg-destructive hover:bg-destructive/90"
                  >
                    {deleting ? 'Deleting...' : 'Permanently Delete'}
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </CardContent>
        </Card>

        {/* App Info */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <Smartphone className="h-4 w-4 text-primary" />
              App Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Version</span>
              <span>1.0.0 (Build 1)</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Build</span>
              <span className="font-mono text-xs">20260603.1</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Cached algorithms</span>
              <span>{appCacheInfo.cachedAlgorithms}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Cached assets</span>
              <span>{appCacheInfo.cachedAssets}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Cache size</span>
              <span>{appCacheInfo.cacheSize}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Last sync</span>
              <span>{appCacheInfo.lastSync}</span>
            </div>
            <Button variant="outline" size="sm" className="w-full mt-2">
              <RefreshCw className="h-4 w-4 mr-2" />
              Clear Local Cache
            </Button>
          </CardContent>
        </Card>

        {/* Footer */}
        <div className="text-center text-xs text-muted-foreground pb-8 space-y-1">
          <p>StrokeSuite ID</p>
          <p>Clinical Decision Support System</p>
          <p>© {new Date().getFullYear()} All rights reserved</p>
        </div>
      </main>
    </div>
  );
}

export default SettingsScreen;