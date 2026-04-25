import React, { useState, useEffect, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { 
  Phone, 
  AlertTriangle, 
  Zap, 
  Users, 
  Settings, 
  History, 
  Plus, 
  Edit, 
  Trash2, 
  CheckCircle2, 
  XCircle, 
  Clock, 
  PhoneCall,
  PhoneOff,
  Bell,
  Building,
  UserPlus,
  Activity
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";

interface StrokeContact {
  id: string;
  name: string;
  phone_number: string;
  role: string;
  code_level: string;
  priority_order: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

interface StrokeSettings {
  id: string;
  facility_id: string;
  nsa_phone_number: string | null;
  nsa_enabled: boolean;
  voice_message_code_1: string;
  voice_message_code_2: string;
  created_at: string;
  updated_at: string;
}

interface StrokeActivation {
  id: string;
  code_level: string;
  patient_id: string;
  location: string;
  activated_by: string | null;
  nsa_notified: boolean;
  nsa_notification_status: string | null;
  notes: string | null;
  created_at: string;
}

interface StrokeCallLog {
  id: string;
  activation_id: string;
  contact_id: string;
  contact_name: string;
  phone_number: string;
  role: string;
  call_status: string;
  call_started_at: string | null;
  call_ended_at: string | null;
  error_message: string | null;
  created_at: string;
}

type ContactRole = 'neurologist' | 'er_physician' | 'radiologist' | 'stroke_nurse' | 'ct_tech' | 'pharmacist' | 'neurosurgeon' | 'icu_physician' | 'lab_tech';
type CodeLevel = 'code_1' | 'code_2';

const ROLE_LABELS: Record<ContactRole, string> = {
  neurologist: "Neurologist",
  er_physician: "ER Physician",
  radiologist: "Radiologist",
  stroke_nurse: "Stroke Nurse",
  ct_tech: "CT Tech",
  pharmacist: "Pharmacist",
  neurosurgeon: "Neurosurgeon",
  icu_physician: "ICU Physician",
  lab_tech: "Lab Tech"
};

const ROLE_OPTIONS = Object.entries(ROLE_LABELS).map(([value, label]) => ({ value: value as ContactRole, label }));

export default function StrokeCodeSystem() {
  const [activeTab, setActiveTab] = useState("activate");
  const [contacts, setContacts] = useState<StrokeContact[]>([]);
  const [settings, setSettings] = useState<StrokeSettings | null>(null);
  const [activations, setActivations] = useState<StrokeActivation[]>([]);
  const [callLogs, setCallLogs] = useState<StrokeCallLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [activating, setActivating] = useState(false);
  const [selectedActivation, setSelectedActivation] = useState<StrokeActivation | null>(null);
  
  // Activation form state
  const [codeLevel, setCodeLevel] = useState<"code_1" | "code_2">("code_1");
  const [patientId, setPatientId] = useState("");
  const [location, setLocation] = useState("");
  const [activatedBy, setActivatedBy] = useState("");
  const [notes, setNotes] = useState("");
  
  // Contact form state
  const [editingContact, setEditingContact] = useState<StrokeContact | null>(null);
  const [contactFormOpen, setContactFormOpen] = useState(false);
  const [contactName, setContactName] = useState("");
  const [contactPhone, setContactPhone] = useState("");
  const [contactRole, setContactRole] = useState<ContactRole>("neurologist");
  const [contactCodeLevel, setContactCodeLevel] = useState<CodeLevel>("code_2");
  const [contactPriority, setContactPriority] = useState(1);
  
  // Settings form state
  const [facilityId, setFacilityId] = useState("");
  const [nsaPhone, setNsaPhone] = useState("");
  const [nsaEnabled, setNsaEnabled] = useState(true);
  const [voiceMessage1, setVoiceMessage1] = useState("");
  const [voiceMessage2, setVoiceMessage2] = useState("");

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const [contactsRes, settingsRes, activationsRes] = await Promise.all([
        supabase.from('stroke_contacts').select('*').order('priority_order'),
        supabase.from('stroke_settings').select('*').limit(1).maybeSingle(),
        supabase.from('stroke_activations').select('*').order('created_at', { ascending: false }).limit(50)
      ]);

      if (contactsRes.data) setContacts(contactsRes.data);
      if (settingsRes.data) {
        setSettings(settingsRes.data);
        setFacilityId(settingsRes.data.facility_id);
        setNsaPhone(settingsRes.data.nsa_phone_number || "");
        setNsaEnabled(settingsRes.data.nsa_enabled);
        setVoiceMessage1(settingsRes.data.voice_message_code_1 || "");
        setVoiceMessage2(settingsRes.data.voice_message_code_2 || "");
      }
      if (activationsRes.data) setActivations(activationsRes.data);
    } catch (error) {
      console.error("Error fetching data:", error);
      toast({ title: "Error loading data", variant: "destructive" });
    }
    setLoading(false);
  }, []);

  const fetchCallLogs = useCallback(async (activationId: string) => {
    const { data, error } = await supabase
      .from('stroke_call_logs')
      .select('*')
      .eq('activation_id', activationId)
      .order('created_at');
    
    if (data) setCallLogs(data);
    if (error) console.error("Error fetching call logs:", error);
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  useEffect(() => {
    if (selectedActivation) {
      fetchCallLogs(selectedActivation.id);
    }
  }, [selectedActivation, fetchCallLogs]);

  const handleActivateCode = async () => {
    if (!patientId.trim() || !location.trim()) {
      toast({ title: "Please fill in patient ID and location", variant: "destructive" });
      return;
    }

    if (contacts.length === 0) {
      toast({ title: "No contacts configured. Please add contacts first.", variant: "destructive" });
      return;
    }

    setActivating(true);
    try {
      // Create activation record
      const { data: activation, error: activationError } = await supabase
        .from('stroke_activations')
        .insert({
          code_level: codeLevel,
          patient_id: patientId.trim(),
          location: location.trim(),
          activated_by: activatedBy.trim() || null,
          notes: notes.trim() || null
        })
        .select()
        .single();

      if (activationError) throw activationError;

      // Filter contacts based on code level
      const contactsToCall = contacts.filter(c => 
        c.is_active && (codeLevel === "code_1" || c.code_level === "code_2")
      );

      // Create call logs for each contact
      const callLogsToInsert = contactsToCall.map(contact => ({
        activation_id: activation.id,
        contact_id: contact.id,
        contact_name: contact.name,
        phone_number: contact.phone_number,
        role: contact.role as ContactRole,
        call_status: 'pending' as const
      }));

      await supabase.from('stroke_call_logs').insert(callLogsToInsert);

      // Trigger the edge function for automated calling
      try {
        const { data: callResult, error: callError } = await supabase.functions.invoke('stroke-code-caller', {
          body: {
            activationId: activation.id,
            codeLevel,
            facilityId: settings?.facility_id || "FACILITY-001",
            nsaEnabled: settings?.nsa_enabled,
            nsaPhone: settings?.nsa_phone_number,
            voiceMessage: codeLevel === "code_1" ? settings?.voice_message_code_1 : settings?.voice_message_code_2
          }
        });

        if (callError) {
          console.error("Edge function error:", callError);
          toast({ 
            title: "Code Activated - Manual calling required",
            description: "Automated calling unavailable. Please call contacts manually.",
            variant: "destructive"
          });
        } else {
          toast({ 
            title: `Stroke Code ${codeLevel === "code_1" ? "1" : "2"} ACTIVATED!`,
            description: `Calling ${contactsToCall.length} contacts...`
          });
        }
      } catch (fnError) {
        console.error("Function invoke error:", fnError);
        toast({ 
          title: "Code Activated - Manual calling required",
          description: "Automated calling unavailable. Please call contacts manually."
        });
      }

      // Refresh data
      fetchData();
      setPatientId("");
      setLocation("");
      setActivatedBy("");
      setNotes("");
      setSelectedActivation(activation);
      setActiveTab("history");
    } catch (error) {
      console.error("Error activating code:", error);
      toast({ title: "Error activating stroke code", variant: "destructive" });
    }
    setActivating(false);
  };

  const isValidPhoneNumber = (phone: string): boolean => {
    return /^\+?[1-9]\d{1,14}$/.test(phone.replace(/[\s\-()]/g, ''));
  };

  const handleSaveContact = async () => {
    if (!contactName.trim() || !contactPhone.trim()) {
      toast({ title: "Please fill in name and phone number", variant: "destructive" });
      return;
    }

    if (contactName.trim().length > 100) {
      toast({ title: "Name must be under 100 characters", variant: "destructive" });
      return;
    }

    const sanitizedPhone = contactPhone.trim().replace(/[\s\-()]/g, '');
    if (!isValidPhoneNumber(sanitizedPhone)) {
      toast({ title: "Invalid phone number", description: "Please use E.164 format (e.g. +1234567890)", variant: "destructive" });
      return;
    }

    try {
      if (editingContact) {
        await supabase
          .from('stroke_contacts')
          .update({
            name: contactName.trim(),
            phone_number: contactPhone.trim(),
            role: contactRole,
            code_level: contactCodeLevel,
            priority_order: contactPriority
          })
          .eq('id', editingContact.id);
        toast({ title: "Contact updated" });
      } else {
        await supabase
          .from('stroke_contacts')
          .insert({
            name: contactName.trim(),
            phone_number: contactPhone.trim(),
            role: contactRole,
            code_level: contactCodeLevel,
            priority_order: contactPriority
          });
        toast({ title: "Contact added" });
      }

      setContactFormOpen(false);
      resetContactForm();
      fetchData();
    } catch (error) {
      console.error("Error saving contact:", error);
      toast({ title: "Error saving contact", variant: "destructive" });
    }
  };

  const handleDeleteContact = async (id: string) => {
    if (!confirm("Are you sure you want to delete this contact?")) return;
    
    try {
      await supabase.from('stroke_contacts').delete().eq('id', id);
      toast({ title: "Contact deleted" });
      fetchData();
    } catch (error) {
      console.error("Error deleting contact:", error);
      toast({ title: "Error deleting contact", variant: "destructive" });
    }
  };

  const handleToggleContactActive = async (contact: StrokeContact) => {
    try {
      await supabase
        .from('stroke_contacts')
        .update({ is_active: !contact.is_active })
        .eq('id', contact.id);
      fetchData();
    } catch (error) {
      console.error("Error toggling contact:", error);
    }
  };

  const handleSaveSettings = async () => {
    if (facilityId.trim().length > 50) {
      toast({ title: "Facility ID must be under 50 characters", variant: "destructive" });
      return;
    }
    if (nsaPhone.trim() && !isValidPhoneNumber(nsaPhone.trim().replace(/[\s\-()]/g, ''))) {
      toast({ title: "Invalid NSA phone number", description: "Please use E.164 format", variant: "destructive" });
      return;
    }
    if (voiceMessage1.trim().length > 500 || voiceMessage2.trim().length > 500) {
      toast({ title: "Voice messages must be under 500 characters", variant: "destructive" });
      return;
    }
    try {
      if (settings) {
        await supabase
          .from('stroke_settings')
          .update({
            facility_id: facilityId.trim(),
            nsa_phone_number: nsaPhone.trim() || null,
            nsa_enabled: nsaEnabled,
            voice_message_code_1: voiceMessage1.trim(),
            voice_message_code_2: voiceMessage2.trim()
          })
          .eq('id', settings.id);
      } else {
        await supabase
          .from('stroke_settings')
          .insert({
            facility_id: facilityId.trim(),
            nsa_phone_number: nsaPhone.trim() || null,
            nsa_enabled: nsaEnabled,
            voice_message_code_1: voiceMessage1.trim(),
            voice_message_code_2: voiceMessage2.trim()
          });
      }
      toast({ title: "Settings saved" });
      fetchData();
    } catch (error) {
      console.error("Error saving settings:", error);
      toast({ title: "Error saving settings", variant: "destructive" });
    }
  };

  const resetContactForm = () => {
    setEditingContact(null);
    setContactName("");
    setContactPhone("");
    setContactRole("neurologist");
    setContactCodeLevel("code_2");
    setContactPriority(1);
  };

  const openEditContact = (contact: StrokeContact) => {
    setEditingContact(contact);
    setContactName(contact.name);
    setContactPhone(contact.phone_number);
    setContactRole(contact.role as ContactRole);
    setContactCodeLevel(contact.code_level as CodeLevel);
    setContactPriority(contact.priority_order);
    setContactFormOpen(true);
  };

  const getCallStatusIcon = (status: string) => {
    switch (status) {
      case 'success': return <CheckCircle2 className="h-4 w-4 text-green-500" />;
      case 'failed': return <XCircle className="h-4 w-4 text-red-500" />;
      case 'no_answer': return <PhoneOff className="h-4 w-4 text-amber-500" />;
      case 'calling': return <PhoneCall className="h-4 w-4 text-blue-500 animate-pulse" />;
      default: return <Clock className="h-4 w-4 text-muted-foreground" />;
    }
  };

  const getCallStatusBadge = (status: string) => {
    const variants: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
      success: "default",
      failed: "destructive",
      calling: "secondary",
      pending: "outline",
      no_answer: "secondary"
    };
    return (
      <Badge variant={variants[status] || "outline"} className="capitalize">
        {status.replace('_', ' ')}
      </Badge>
    );
  };

  const dialNumber = (phone: string) => {
    window.location.href = `tel:${phone}`;
  };

  if (loading) {
    return (
      <Card className="border-2 border-red-500 bg-red-50/50 dark:bg-red-950/30">
        <CardContent className="p-8 text-center">
          <Activity className="h-8 w-8 animate-spin mx-auto text-red-500" />
          <p className="mt-2 text-muted-foreground">Loading Stroke Code System...</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-2 border-red-500 bg-gradient-to-br from-red-50 to-red-100/50 dark:from-red-950/50 dark:to-red-900/30">
      <CardHeader className="bg-red-500 text-white rounded-t-lg">
        <CardTitle className="flex items-center gap-3 text-xl">
          <div className="p-2 bg-white/20 rounded-lg animate-pulse">
            <Zap className="h-6 w-6" />
          </div>
          STROKE CODE SYSTEM
          <Badge variant="outline" className="ml-auto text-white border-white/50">
            {contacts.filter(c => c.is_active).length} Active Contacts
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="w-full grid grid-cols-4 rounded-none border-b bg-red-100/50 dark:bg-red-900/30">
            <TabsTrigger value="activate" className="flex items-center gap-2">
              <AlertTriangle className="h-4 w-4" />
              Activate Code
            </TabsTrigger>
            <TabsTrigger value="contacts" className="flex items-center gap-2">
              <Users className="h-4 w-4" />
              Contacts
            </TabsTrigger>
            <TabsTrigger value="settings" className="flex items-center gap-2">
              <Settings className="h-4 w-4" />
              Settings
            </TabsTrigger>
            <TabsTrigger value="history" className="flex items-center gap-2">
              <History className="h-4 w-4" />
              Audit Trail
            </TabsTrigger>
          </TabsList>

          {/* Activate Code Tab */}
          <TabsContent value="activate" className="p-6 space-y-6">
            {/* Code Level Selection */}
            <div className="grid grid-cols-2 gap-4">
              <Button
                variant={codeLevel === "code_1" ? "default" : "outline"}
                className={`h-24 text-lg font-bold ${codeLevel === "code_1" ? "bg-red-600 hover:bg-red-700 animate-pulse" : "border-red-300"}`}
                onClick={() => setCodeLevel("code_1")}
              >
                <div className="flex flex-col items-center gap-2">
                  <Zap className="h-8 w-8" />
                  <span>STROKE CODE 1</span>
                  <span className="text-xs font-normal opacity-80">All contacts + Neurosurgery</span>
                </div>
              </Button>
              <Button
                variant={codeLevel === "code_2" ? "default" : "outline"}
                className={`h-24 text-lg font-bold ${codeLevel === "code_2" ? "bg-amber-600 hover:bg-amber-700" : "border-amber-300"}`}
                onClick={() => setCodeLevel("code_2")}
              >
                <div className="flex flex-col items-center gap-2">
                  <AlertTriangle className="h-8 w-8" />
                  <span>STROKE CODE 2</span>
                  <span className="text-xs font-normal opacity-80">Standard stroke team</span>
                </div>
              </Button>
            </div>

            {/* Activation Form */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="patientId" className="text-red-700 dark:text-red-400 font-medium">Patient ID *</Label>
                <Input
                  id="patientId"
                  placeholder="Enter anonymous patient ID"
                  value={patientId}
                  onChange={(e) => setPatientId(e.target.value)}
                  className="border-red-200 dark:border-red-800"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="location" className="text-red-700 dark:text-red-400 font-medium">Location *</Label>
                <Input
                  id="location"
                  placeholder="e.g., ER Bay 3, CT Room"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  className="border-red-200 dark:border-red-800"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="activatedBy" className="text-red-700 dark:text-red-400 font-medium">Activated By</Label>
                <Input
                  id="activatedBy"
                  placeholder="Your name/ID"
                  value={activatedBy}
                  onChange={(e) => setActivatedBy(e.target.value)}
                  className="border-red-200 dark:border-red-800"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="notes" className="text-red-700 dark:text-red-400 font-medium">Notes</Label>
                <Input
                  id="notes"
                  placeholder="Additional notes"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="border-red-200 dark:border-red-800"
                />
              </div>
            </div>

            {/* NSA Notification Status */}
            {settings?.nsa_enabled && (
              <div className="bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800 rounded-lg p-4 flex items-center gap-3">
                <Bell className="h-5 w-5 text-blue-500" />
                <div>
                  <p className="font-medium text-blue-700 dark:text-blue-400">National Stroke Association Alert</p>
                  <p className="text-sm text-blue-600 dark:text-blue-500">
                    {settings.nsa_phone_number 
                      ? `Will automatically notify NSA at ${settings.nsa_phone_number}`
                      : "NSA phone number not configured"
                    }
                  </p>
                </div>
              </div>
            )}

            {/* Activate Button */}
            <Button
              onClick={handleActivateCode}
              disabled={activating || !patientId.trim() || !location.trim()}
              className={`w-full h-16 text-xl font-bold ${
                codeLevel === "code_1" 
                  ? "bg-red-600 hover:bg-red-700 animate-pulse" 
                  : "bg-amber-600 hover:bg-amber-700"
              }`}
            >
              {activating ? (
                <>
                  <Activity className="h-6 w-6 animate-spin mr-2" />
                  ACTIVATING...
                </>
              ) : (
                <>
                  <Zap className="h-6 w-6 mr-2" />
                  ACTIVATE {codeLevel === "code_1" ? "STROKE CODE 1" : "STROKE CODE 2"}
                </>
              )}
            </Button>
          </TabsContent>

          {/* Contacts Tab */}
          <TabsContent value="contacts" className="p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold text-lg">Stroke Team Contacts</h3>
              <Dialog open={contactFormOpen} onOpenChange={(open) => { setContactFormOpen(open); if (!open) resetContactForm(); }}>
                <DialogTrigger asChild>
                  <Button size="sm" className="bg-red-600 hover:bg-red-700">
                    <UserPlus className="h-4 w-4 mr-2" />
                    Add Contact
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>{editingContact ? "Edit Contact" : "Add New Contact"}</DialogTitle>
                    <DialogDescription>Configure stroke team contact details</DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4 py-4">
                    <div className="space-y-2">
                      <Label>Name *</Label>
                      <Input value={contactName} onChange={(e) => setContactName(e.target.value)} placeholder="Dr. John Smith" />
                    </div>
                    <div className="space-y-2">
                      <Label>Phone Number *</Label>
                      <Input value={contactPhone} onChange={(e) => setContactPhone(e.target.value)} placeholder="+1234567890" />
                    </div>
                    <div className="space-y-2">
                      <Label>Role</Label>
                      <Select value={contactRole} onValueChange={(v) => setContactRole(v as ContactRole)}>
                        <SelectTrigger><SelectValue /></SelectTrigger>
                        <SelectContent>
                          {ROLE_OPTIONS.map(role => (
                            <SelectItem key={role.value} value={role.value}>{role.label}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label>Code Level</Label>
                      <Select value={contactCodeLevel} onValueChange={(v) => setContactCodeLevel(v as CodeLevel)}>
                        <SelectTrigger><SelectValue /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="code_1">Code 1 Only (Critical)</SelectItem>
                          <SelectItem value="code_2">All Codes (Standard)</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label>Priority Order (lower = called first)</Label>
                      <Input type="number" min={1} value={contactPriority} onChange={(e) => setContactPriority(parseInt(e.target.value) || 1)} />
                    </div>
                  </div>
                  <DialogFooter>
                    <Button variant="outline" onClick={() => setContactFormOpen(false)}>Cancel</Button>
                    <Button onClick={handleSaveContact} className="bg-red-600 hover:bg-red-700">Save</Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </div>

            <div className="rounded-lg border overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow className="bg-red-50 dark:bg-red-950/30">
                    <TableHead>Priority</TableHead>
                    <TableHead>Name</TableHead>
                    <TableHead>Role</TableHead>
                    <TableHead>Phone</TableHead>
                    <TableHead>Code Level</TableHead>
                    <TableHead>Active</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {contacts.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center text-muted-foreground py-8">
                        No contacts configured. Add contacts to enable stroke code activation.
                      </TableCell>
                    </TableRow>
                  ) : (
                    contacts.map(contact => (
                      <TableRow key={contact.id} className={!contact.is_active ? "opacity-50" : ""}>
                        <TableCell className="font-mono">{contact.priority_order}</TableCell>
                        <TableCell className="font-medium">{contact.name}</TableCell>
                        <TableCell>
                          <Badge variant="secondary">{ROLE_LABELS[contact.role]}</Badge>
                        </TableCell>
                        <TableCell>
                          <Button variant="link" size="sm" className="p-0 h-auto" onClick={() => dialNumber(contact.phone_number)}>
                            <Phone className="h-3 w-3 mr-1" />
                            {contact.phone_number}
                          </Button>
                        </TableCell>
                        <TableCell>
                          <Badge variant={contact.code_level === "code_1" ? "destructive" : "outline"}>
                            {contact.code_level === "code_1" ? "Code 1 Only" : "All Codes"}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Switch checked={contact.is_active} onCheckedChange={() => handleToggleContactActive(contact)} />
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1">
                            <Button variant="ghost" size="icon" onClick={() => openEditContact(contact)}>
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button variant="ghost" size="icon" onClick={() => handleDeleteContact(contact.id)}>
                              <Trash2 className="h-4 w-4 text-red-500" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          </TabsContent>

          {/* Settings Tab */}
          <TabsContent value="settings" className="p-6 space-y-6">
            <div className="grid gap-6">
              {/* Facility Settings */}
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-base flex items-center gap-2">
                    <Building className="h-4 w-4" />
                    Facility Settings
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label>Facility ID</Label>
                    <Input value={facilityId} onChange={(e) => setFacilityId(e.target.value)} placeholder="FACILITY-001" />
                  </div>
                </CardContent>
              </Card>

              {/* NSA Integration */}
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-base flex items-center gap-2">
                    <Bell className="h-4 w-4" />
                    National Stroke Association Integration
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <Label>Enable NSA Alerts</Label>
                      <p className="text-sm text-muted-foreground">Automatically notify NSA on every code activation</p>
                    </div>
                    <Switch checked={nsaEnabled} onCheckedChange={setNsaEnabled} />
                  </div>
                  {nsaEnabled && (
                    <div className="space-y-2">
                      <Label>NSA Phone Number</Label>
                      <Input value={nsaPhone} onChange={(e) => setNsaPhone(e.target.value)} placeholder="+1234567890" />
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Voice Messages */}
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-base flex items-center gap-2">
                    <Phone className="h-4 w-4" />
                    Voice Messages
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label>Code 1 Voice Message</Label>
                    <Textarea 
                      value={voiceMessage1} 
                      onChange={(e) => setVoiceMessage1(e.target.value)} 
                      placeholder="Stroke Code 1 activated. This is an emergency. Please respond immediately."
                      rows={2}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Code 2 Voice Message</Label>
                    <Textarea 
                      value={voiceMessage2} 
                      onChange={(e) => setVoiceMessage2(e.target.value)} 
                      placeholder="Stroke Code 2 activated. Please respond as soon as possible."
                      rows={2}
                    />
                  </div>
                </CardContent>
              </Card>

              <Button onClick={handleSaveSettings} className="bg-red-600 hover:bg-red-700">
                Save Settings
              </Button>
            </div>
          </TabsContent>

          {/* Audit Trail Tab */}
          <TabsContent value="history" className="p-6 space-y-4">
            <h3 className="font-semibold text-lg">Activation History</h3>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {/* Activations List */}
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm">Recent Activations</CardTitle>
                </CardHeader>
                <CardContent className="p-0">
                  <ScrollArea className="h-[400px]">
                    {activations.length === 0 ? (
                      <p className="text-center text-muted-foreground p-4">No activations yet</p>
                    ) : (
                      <div className="divide-y">
                        {activations.map(activation => (
                          <div 
                            key={activation.id}
                            className={`p-3 cursor-pointer hover:bg-muted/50 ${selectedActivation?.id === activation.id ? "bg-red-50 dark:bg-red-950/30" : ""}`}
                            onClick={() => setSelectedActivation(activation)}
                          >
                            <div className="flex items-center justify-between mb-1">
                              <Badge variant={activation.code_level === "code_1" ? "destructive" : "secondary"}>
                                {activation.code_level === "code_1" ? "CODE 1" : "CODE 2"}
                              </Badge>
                              <span className="text-xs text-muted-foreground">
                                {new Date(activation.created_at).toLocaleString()}
                              </span>
                            </div>
                            <p className="text-sm font-medium">Patient: {activation.patient_id}</p>
                            <p className="text-xs text-muted-foreground">Location: {activation.location}</p>
                            <div className="flex items-center gap-2 mt-1">
                              {activation.nsa_notified ? (
                                <Badge variant="outline" className="text-xs">
                                  <CheckCircle2 className="h-3 w-3 mr-1 text-green-500" />
                                  NSA Notified
                                </Badge>
                              ) : (
                                <Badge variant="outline" className="text-xs">
                                  <XCircle className="h-3 w-3 mr-1 text-red-500" />
                                  NSA Not Notified
                                </Badge>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </ScrollArea>
                </CardContent>
              </Card>

              {/* Call Logs */}
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm">
                    {selectedActivation 
                      ? `Call Log - ${new Date(selectedActivation.created_at).toLocaleString()}`
                      : "Select an activation to view call log"
                    }
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-0">
                  <ScrollArea className="h-[400px]">
                    {!selectedActivation ? (
                      <p className="text-center text-muted-foreground p-4">Click an activation to view details</p>
                    ) : callLogs.length === 0 ? (
                      <p className="text-center text-muted-foreground p-4">No call logs for this activation</p>
                    ) : (
                      <div className="divide-y">
                        {callLogs.map(log => (
                          <div key={log.id} className="p-3">
                            <div className="flex items-center justify-between mb-1">
                              <div className="flex items-center gap-2">
                                {getCallStatusIcon(log.call_status)}
                                <span className="font-medium text-sm">{log.contact_name}</span>
                              </div>
                              {getCallStatusBadge(log.call_status)}
                            </div>
                            <p className="text-xs text-muted-foreground">{ROLE_LABELS[log.role]}</p>
                            <Button 
                              variant="link" 
                              size="sm" 
                              className="p-0 h-auto text-xs"
                              onClick={() => dialNumber(log.phone_number)}
                            >
                              <Phone className="h-3 w-3 mr-1" />
                              {log.phone_number}
                            </Button>
                            {log.error_message && (
                              <p className="text-xs text-red-500 mt-1">{log.error_message}</p>
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                  </ScrollArea>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}
