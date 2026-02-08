import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  Users, Plus, Search, Clock, User, LogOut, Shield, 
  FileText, Calendar, ArrowRight, Play 
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { format } from 'date-fns';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';

interface Patient {
  id: string;
  patient_id: string;
  name: string | null;
  weight: number | null;
  age: number | null;
  sex: string | null;
  last_known_well: string | null;
  demographics: Record<string, unknown>;
  clinical_data: Record<string, unknown>;
  created_by: string | null;
  last_edited_by: string | null;
  created_at: string;
  updated_at: string;
}

interface PatientSelectorProps {
  onSelectPatient: (patient: Patient) => void;
  onEnterDemoMode?: () => void;
}

export function PatientSelector({ onSelectPatient, onEnterDemoMode }: PatientSelectorProps) {
  const [patients, setPatients] = useState<Patient[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [newPatientId, setNewPatientId] = useState('');
  const [newPatientName, setNewPatientName] = useState('');
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [creating, setCreating] = useState(false);
  const { user, profile, isAdmin, signOut } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    fetchPatients();
  }, []);

  const fetchPatients = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('patients')
        .select('*')
        .order('updated_at', { ascending: false });

      if (error) throw error;
      setPatients((data as Patient[]) || []);
    } catch (error) {
      console.error('Error fetching patients:', error);
      toast({ title: 'Error', description: 'Failed to load patients', variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  const handleCreatePatient = async () => {
    if (!newPatientId.trim()) {
      toast({ title: 'Error', description: 'Patient ID is required', variant: 'destructive' });
      return;
    }

    setCreating(true);
    try {
      const { data, error } = await supabase
        .from('patients')
        .insert({
          patient_id: newPatientId.trim(),
          name: newPatientName.trim() || null,
          created_by: user?.id,
          last_edited_by: user?.id,
        })
        .select()
        .single();

      if (error) throw error;

      toast({ title: 'Success', description: 'Patient created successfully' });
      setCreateDialogOpen(false);
      setNewPatientId('');
      setNewPatientName('');
      onSelectPatient(data as Patient);
    } catch (error) {
      console.error('Error creating patient:', error);
      toast({ title: 'Error', description: 'Failed to create patient', variant: 'destructive' });
    } finally {
      setCreating(false);
    }
  };

  const filteredPatients = patients.filter(patient => 
    patient.patient_id.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (patient.name && patient.name.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const handleSignOut = async () => {
    await signOut();
    toast({ title: 'Signed out', description: 'You have been logged out' });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-muted p-4">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="bg-primary/10 p-2 rounded-full">
              <Users className="h-6 w-6 text-primary" />
            </div>
            <div>
              <h1 className="text-2xl font-bold">StrokeSuite</h1>
              <p className="text-sm text-muted-foreground">Patient Management</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="text-right">
              <div className="flex items-center gap-2">
                <span className="font-medium">{profile?.display_name || profile?.username}</span>
                {isAdmin && (
                  <Badge variant="secondary" className="flex items-center gap-1">
                    <Shield className="h-3 w-3" />
                    Admin
                  </Badge>
                )}
              </div>
              <p className="text-xs text-muted-foreground">@{profile?.username}</p>
            </div>
            <Button variant="ghost" size="icon" onClick={handleSignOut}>
              <LogOut className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Actions Bar */}
        <div className="flex gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search by patient ID or name..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
          <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
            <DialogTrigger asChild>
              <Button className="flex items-center gap-2">
                <Plus className="h-4 w-4" />
                New Patient
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Create New Patient</DialogTitle>
                <DialogDescription>
                  Enter the patient details to create a new case
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 mt-4">
                <div className="space-y-2">
                  <Label htmlFor="patient-id">Patient ID *</Label>
                  <Input
                    id="patient-id"
                    placeholder="e.g., MRN-12345"
                    value={newPatientId}
                    onChange={(e) => setNewPatientId(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="patient-name">Patient Name (optional)</Label>
                  <Input
                    id="patient-name"
                    placeholder="e.g., John Doe"
                    value={newPatientName}
                    onChange={(e) => setNewPatientName(e.target.value)}
                  />
                </div>
                <Button 
                  onClick={handleCreatePatient} 
                  className="w-full"
                  disabled={creating}
                >
                  {creating ? 'Creating...' : 'Create Patient'}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
          {onEnterDemoMode && (
            <Button 
              variant="outline" 
              onClick={onEnterDemoMode}
              className="flex items-center gap-2 border-amber-500/50 text-amber-600 hover:bg-amber-500/10 hover:text-amber-500 dark:text-amber-400 dark:hover:text-amber-300"
            >
              <Play className="h-4 w-4" />
              Demo Mode
            </Button>
          )}
        </div>

        {/* Patient List */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Patient Cases
            </CardTitle>
            <CardDescription>
              {isAdmin 
                ? 'Viewing all patient cases (admin access)' 
                : 'Viewing your patient cases'}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="text-center py-8 text-muted-foreground">
                Loading patients...
              </div>
            ) : filteredPatients.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                {searchQuery 
                  ? 'No patients match your search' 
                  : 'No patients yet. Create your first case!'}
              </div>
            ) : (
              <ScrollArea className="h-[400px]">
                <div className="space-y-2">
                  {filteredPatients.map((patient) => (
                    <div
                      key={patient.id}
                      onClick={() => onSelectPatient(patient)}
                      className="flex items-center justify-between p-4 rounded-lg border bg-card hover:bg-accent/50 cursor-pointer transition-colors"
                    >
                      <div className="flex items-center gap-4">
                        <div className="bg-primary/10 p-2 rounded-full">
                          <User className="h-5 w-5 text-primary" />
                        </div>
                        <div>
                          <div className="font-medium flex items-center gap-2">
                            {patient.patient_id}
                            {patient.name && (
                              <span className="text-muted-foreground font-normal">
                                — {patient.name}
                              </span>
                            )}
                          </div>
                          <div className="flex items-center gap-3 text-xs text-muted-foreground mt-1">
                            <span className="flex items-center gap-1">
                              <Calendar className="h-3 w-3" />
                              {format(new Date(patient.created_at), 'MMM d, yyyy')}
                            </span>
                            <span className="flex items-center gap-1">
                              <Clock className="h-3 w-3" />
                              Updated {format(new Date(patient.updated_at), 'MMM d, h:mm a')}
                            </span>
                          </div>
                        </div>
                      </div>
                      <ArrowRight className="h-5 w-5 text-muted-foreground" />
                    </div>
                  ))}
                </div>
              </ScrollArea>
            )}
          </CardContent>
        </Card>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4">
          <Card>
            <CardContent className="pt-6">
              <div className="text-2xl font-bold">{patients.length}</div>
              <p className="text-xs text-muted-foreground">Total Patients</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="text-2xl font-bold">
                {patients.filter(p => {
                  const updated = new Date(p.updated_at);
                  const now = new Date();
                  return (now.getTime() - updated.getTime()) < 24 * 60 * 60 * 1000;
                }).length}
              </div>
              <p className="text-xs text-muted-foreground">Updated Today</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="text-2xl font-bold">
                {patients.filter(p => p.created_by === user?.id).length}
              </div>
              <p className="text-xs text-muted-foreground">Your Cases</p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
