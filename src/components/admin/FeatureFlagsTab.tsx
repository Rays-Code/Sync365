import { useState, useEffect, useCallback, useMemo } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { 
  Loader2, Plus, Trash2, Save, Globe, Flag, Eye, 
  ShieldCheck, Lock, Unlock, BarChart3, RefreshCw, ShieldAlert
} from 'lucide-react';
import CountryAccessManager from './CountryAccessManager';

// Types
interface FeatureFlag {
  id?: string;
  country_code: string;
  feature_key: string;
  is_enabled: boolean;
  access_tier: 'all' | 'paid' | 'disabled';
  reason: string;
  updated_by: string;
  updated_at: string;
}

// Constants
const ALL_COUNTRIES = [
  { code: 'AU', name: 'Australia', emoji: '????' },
  { code: 'IN', name: 'India', emoji: '????' },
  { code: 'PK', name: 'Pakistan', emoji: '????' },
  { code: 'US', name: 'United States', emoji: '????' },
  { code: 'GB', name: 'United Kingdom', emoji: '????' },
  { code: 'NZ', name: 'New Zealand', emoji: '????' },
  { code: 'CA', name: 'Canada', emoji: '????' },
  { code: 'SG', name: 'Singapore', emoji: '????' },
  { code: 'AE', name: 'UAE', emoji: '????' },
  { code: 'SA', name: 'Saudi Arabia', emoji: '????' },
  { code: 'BD', name: 'Bangladesh', emoji: '????' },
  { code: 'LK', name: 'Sri Lanka', emoji: '????' },
  { code: 'NP', name: 'Nepal', emoji: '????' },
  { code: 'PH', name: 'Philippines', emoji: '????' },
  { code: 'MY', name: 'Malaysia', emoji: '????' },
];

const ALL_FEATURE_KEYS = [
  'home_dashboard', 'calendar', 'insights_tab', 'mood_ai_tab', 'profile_tab',
  'log_entry', 'daily_checkin', 'reminders', 'ai_insights', 'ai_chatbot',
  'ai_mood_forecast', 'advanced_analytics', 'symptom_checker', 'pregnancy_mode',
  'pregnancy_dashboard', 'pregnancy_calendar', 'pregnancy_log', 'pregnancy_setup',
  'pregnancy_appointments', 'baby_development', 'kick_counter', 'contraction_timer',
  'postpartum_dashboard', 'partner_sharing', 'partner_link', 'partner_summary',
  'partner_education', 'relationship_dashboard', 'telehealth', 'book_appointment',
  'my_appointments', 'consultation', 'emergency_contacts', 'data_export',
  'subscription_management', 'redeem_code', 'edit_profile', 'help_support',
  'privacy_policy', 'terms_of_service', 'consent_management'
];

const FEATURE_LABELS: Record<string, string> = {
  home_dashboard: 'Home Dashboard', calendar: 'Calendar', insights_tab: 'Insights Tab',
  mood_ai_tab: 'Mood AI Tab', profile_tab: 'Profile Tab', log_entry: 'Log Entry',
  daily_checkin: 'Daily Check-in', reminders: 'Reminders', ai_insights: 'AI Insights',
  ai_chatbot: 'AI Chatbot', ai_mood_forecast: 'AI Mood Forecast',
  advanced_analytics: 'Advanced Analytics', symptom_checker: 'Symptom Checker',
  pregnancy_mode: 'Pregnancy Mode', pregnancy_dashboard: 'Pregnancy Dashboard',
  pregnancy_calendar: 'Pregnancy Calendar', pregnancy_log: 'Pregnancy Log',
  pregnancy_setup: 'Pregnancy Setup', pregnancy_appointments: 'Pregnancy Appointments',
  baby_development: 'Baby Development', kick_counter: 'Kick Counter',
  contraction_timer: 'Contraction Timer', postpartum_dashboard: 'Postpartum Dashboard',
  partner_sharing: 'Partner Sharing', partner_link: 'Partner Link',
  partner_summary: 'Partner Summary', partner_education: 'Partner Education',
  relationship_dashboard: 'Relationship Dashboard', telehealth: 'Telehealth',
  book_appointment: 'Book Appointment', my_appointments: 'My Appointments',
  consultation: 'Consultation', emergency_contacts: 'Emergency Contacts',
  data_export: 'Data Export', subscription_management: 'Subscription Management',
  redeem_code: 'Redeem Code', edit_profile: 'Edit Profile',
  help_support: 'Help & Support', privacy_policy: 'Privacy Policy',
  terms_of_service: 'Terms of Service', consent_management: 'Consent Management',
};

// Helper to call external DB
async function fetchFlags(): Promise<FeatureFlag[]> {
  const { data: sessionData } = await supabase.auth.getSession();
  const response = await supabase.functions.invoke('external-db-query', {
    body: { table: 'country_feature_flags', limit: 1000, offset: 0 },
    headers: sessionData.session ? { Authorization: `Bearer ${sessionData.session.access_token}` } : {},
  });
  if (response.error) throw new Error(response.error.message);
  const raw = response.data.data || [];
  return raw.map((r: any) => ({
    id: r.id,
    country_code: r.country_code,
    feature_key: r.feature_key,
    is_enabled: r.enabled,
    access_tier: r.access_tier || 'all',
    reason: r.reason || '',
    updated_by: r.updated_by || '',
    updated_at: r.updated_at || '',
  }));
}

async function upsertFlags(flags: Partial<FeatureFlag>[], onConflict = 'country_code,feature_key') {
  const { data: sessionData } = await supabase.auth.getSession();
  const dbRows = flags.map(({ is_enabled, ...rest }) => ({ ...rest, enabled: is_enabled }));
  const response = await supabase.functions.invoke('external-db-mutate', {
    body: { table: 'country_feature_flags', operation: 'upsert', data: dbRows, onConflict },
    headers: sessionData.session ? { Authorization: `Bearer ${sessionData.session.access_token}` } : {},
  });
  if (response.error) throw new Error(response.error.message);
  return response.data;
}

async function deleteFlag(id: string) {
  const { data: sessionData } = await supabase.auth.getSession();
  const response = await supabase.functions.invoke('external-db-mutate', {
    body: { table: 'country_feature_flags', operation: 'delete', id },
    headers: sessionData.session ? { Authorization: `Bearer ${sessionData.session.access_token}` } : {},
  });
  if (response.error) throw new Error(response.error.message);
  return response.data;
}

// ============ SUB-COMPONENTS ============

// 1. Overview Dashboard
function FlagsDashboard({ flags, onSelectCountry }: { flags: FeatureFlag[]; onSelectCountry: (code: string) => void }) {
  const countryStats = useMemo(() => {
    const map: Record<string, { total: number; disabled: number; paid: number; open: number }> = {};
    flags.forEach(f => {
      if (!map[f.country_code]) map[f.country_code] = { total: 0, disabled: 0, paid: 0, open: 0 };
      map[f.country_code].total++;
      if (!f.is_enabled) map[f.country_code].disabled++;
      else if (f.access_tier === 'paid') map[f.country_code].paid++;
      else if (f.access_tier === 'all') map[f.country_code].open++;
    });
    return map;
  }, [flags]);

  const totalCountries = Object.keys(countryStats).length;
  const totalFlags = flags.length;
  const totalDisabled = flags.filter(f => !f.is_enabled).length;
  const totalPaid = flags.filter(f => f.is_enabled && f.access_tier === 'paid').length;

  return (
    <div className="space-y-6">
      {/* Summary Bar */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card><CardContent className="p-4 text-center">
          <p className="text-2xl font-bold text-foreground">{totalCountries}</p>
          <p className="text-xs text-muted-foreground">Countries Configured</p>
        </CardContent></Card>
        <Card><CardContent className="p-4 text-center">
          <p className="text-2xl font-bold text-foreground">{totalFlags}</p>
          <p className="text-xs text-muted-foreground">Total Flags</p>
        </CardContent></Card>
        <Card><CardContent className="p-4 text-center">
          <p className="text-2xl font-bold text-destructive">{totalDisabled}</p>
          <p className="text-xs text-muted-foreground">Disabled</p>
        </CardContent></Card>
        <Card><CardContent className="p-4 text-center">
          <p className="text-2xl font-bold text-accent">{totalPaid}</p>
          <p className="text-xs text-muted-foreground">Paid Only</p>
        </CardContent></Card>
      </div>

      {/* Country Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {Object.entries(countryStats).map(([code, stats]) => {
          const country = ALL_COUNTRIES.find(c => c.code === code);
          return (
            <Card 
              key={code} 
              className="cursor-pointer hover:border-primary/50 transition-colors"
              onClick={() => onSelectCountry(code)}
            >
              <CardHeader className="pb-2">
                <CardTitle className="text-lg flex items-center gap-2">
                  <span className="text-2xl">{country?.emoji || '???'}</span>
                  {country?.name || code}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-1">
                <p className="text-sm text-muted-foreground">{stats.total} flags configured</p>
                <div className="flex gap-2 flex-wrap">
                  <Badge variant="outline" className="text-secondary border-secondary/30">{stats.open} open</Badge>
                  <Badge variant="outline" className="text-accent border-accent/30">{stats.paid} paid</Badge>
                  <Badge variant="outline" className="text-destructive border-destructive/30">{stats.disabled} disabled</Badge>
                </div>
              </CardContent>
            </Card>
          );
        })}
        {totalCountries === 0 && (
          <p className="text-muted-foreground col-span-full text-center py-8">No countries configured yet. Use the Country Editor to get started.</p>
        )}
      </div>
    </div>
  );
}

// 2. All Flags Table
function FlagsTable({ flags, adminEmail, onRefresh }: { flags: FeatureFlag[]; adminEmail: string; onRefresh: () => void }) {
  const [filterCountry, setFilterCountry] = useState<string>('all');
  const [filterFeature, setFilterFeature] = useState<string>('all');
  const [addOpen, setAddOpen] = useState(false);
  const [newFlag, setNewFlag] = useState<Partial<FeatureFlag>>({ country_code: 'AU', feature_key: ALL_FEATURE_KEYS[0], is_enabled: true, access_tier: 'all', reason: '' });
  const [saving, setSaving] = useState<string | null>(null);

  const filtered = useMemo(() => {
    return flags.filter(f => {
      if (filterCountry !== 'all' && f.country_code !== filterCountry) return false;
      if (filterFeature !== 'all' && f.feature_key !== filterFeature) return false;
      return true;
    });
  }, [flags, filterCountry, filterFeature]);

  const uniqueCountries = useMemo(() => [...new Set(flags.map(f => f.country_code))].sort(), [flags]);
  const uniqueFeatures = useMemo(() => [...new Set(flags.map(f => f.feature_key))].sort(), [flags]);

  const handleToggle = async (flag: FeatureFlag) => {
    setSaving(flag.id || null);
    try {
      await upsertFlags([{ ...flag, is_enabled: !flag.is_enabled, updated_by: adminEmail, updated_at: new Date().toISOString() }]);
      toast.success('Flag updated');
      onRefresh();
    } catch (e: any) { toast.error(e.message); }
    setSaving(null);
  };

  const handleTierChange = async (flag: FeatureFlag, tier: string) => {
    setSaving(flag.id || null);
    try {
      await upsertFlags([{ ...flag, access_tier: tier as any, updated_by: adminEmail, updated_at: new Date().toISOString() }]);
      toast.success('Tier updated');
      onRefresh();
    } catch (e: any) { toast.error(e.message); }
    setSaving(null);
  };

  const handleDelete = async (flag: FeatureFlag) => {
    if (!flag.id || !confirm('Delete this flag?')) return;
    try {
      await deleteFlag(flag.id);
      toast.success('Flag deleted');
      onRefresh();
    } catch (e: any) { toast.error(e.message); }
  };

  const handleAdd = async () => {
    try {
      await upsertFlags([{ ...newFlag, updated_by: adminEmail, updated_at: new Date().toISOString() }]);
      toast.success('Flag added');
      setAddOpen(false);
      onRefresh();
    } catch (e: any) { toast.error(e.message); }
  };

  return (
    <div className="space-y-4">
      {/* Filters */}
      <div className="flex flex-wrap gap-3 items-center">
        <Select value={filterCountry} onValueChange={setFilterCountry}>
          <SelectTrigger className="w-[160px]"><SelectValue placeholder="All Countries" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Countries</SelectItem>
            {uniqueCountries.map(c => <SelectItem key={c} value={c}>{ALL_COUNTRIES.find(x => x.code === c)?.emoji} {c}</SelectItem>)}
          </SelectContent>
        </Select>
        <Select value={filterFeature} onValueChange={setFilterFeature}>
          <SelectTrigger className="w-[200px]"><SelectValue placeholder="All Features" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Features</SelectItem>
            {uniqueFeatures.map(f => <SelectItem key={f} value={f}>{FEATURE_LABELS[f] || f}</SelectItem>)}
          </SelectContent>
        </Select>

        <Dialog open={addOpen} onOpenChange={setAddOpen}>
          <DialogTrigger asChild>
            <Button size="sm"><Plus className="w-4 h-4 mr-1" /> Add Flag</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader><DialogTitle>Add Feature Flag</DialogTitle></DialogHeader>
            <div className="space-y-4">
              <div>
                <Label>Country</Label>
                <Select value={newFlag.country_code} onValueChange={v => setNewFlag(p => ({ ...p, country_code: v }))}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>{ALL_COUNTRIES.map(c => <SelectItem key={c.code} value={c.code}>{c.emoji} {c.name}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div>
                <Label>Feature</Label>
                <Select value={newFlag.feature_key} onValueChange={v => setNewFlag(p => ({ ...p, feature_key: v }))}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>{ALL_FEATURE_KEYS.map(f => <SelectItem key={f} value={f}>{FEATURE_LABELS[f] || f}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div className="flex items-center gap-2">
                <Label>Enabled</Label>
                <Switch checked={newFlag.is_enabled} onCheckedChange={v => setNewFlag(p => ({ ...p, is_enabled: v }))} />
              </div>
              <div>
                <Label>Access Tier</Label>
                <Select value={newFlag.access_tier} onValueChange={v => setNewFlag(p => ({ ...p, access_tier: v as any }))}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All</SelectItem>
                    <SelectItem value="paid">Paid</SelectItem>
                    <SelectItem value="disabled">Disabled</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Reason</Label>
                <Input value={newFlag.reason || ''} onChange={e => setNewFlag(p => ({ ...p, reason: e.target.value }))} placeholder="Optional reason" />
              </div>
              <Button onClick={handleAdd} className="w-full">Add Flag</Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Table */}
      <div className="border rounded-lg">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Country</TableHead>
              <TableHead>Feature</TableHead>
              <TableHead>Enabled</TableHead>
              <TableHead>Access Tier</TableHead>
              <TableHead>Reason</TableHead>
              <TableHead>Updated By</TableHead>
              <TableHead></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.length === 0 && (
              <TableRow><TableCell colSpan={7} className="text-center text-muted-foreground py-8">No flags found</TableCell></TableRow>
            )}
            {filtered.map((flag, i) => (
              <TableRow key={flag.id || i}>
                <TableCell>
                  <span className="mr-1">{ALL_COUNTRIES.find(c => c.code === flag.country_code)?.emoji}</span>
                  {flag.country_code}
                </TableCell>
                <TableCell className="font-mono text-xs">{FEATURE_LABELS[flag.feature_key] || flag.feature_key}</TableCell>
                <TableCell>
                  <Switch 
                    checked={flag.is_enabled} 
                    onCheckedChange={() => handleToggle(flag)} 
                    disabled={saving === flag.id}
                  />
                </TableCell>
                <TableCell>
                  <Select value={flag.access_tier} onValueChange={v => handleTierChange(flag, v)}>
                    <SelectTrigger className="w-[100px] h-8 text-xs"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All</SelectItem>
                      <SelectItem value="paid">Paid</SelectItem>
                      <SelectItem value="disabled">Disabled</SelectItem>
                    </SelectContent>
                  </Select>
                </TableCell>
                <TableCell className="max-w-[200px] truncate text-xs text-muted-foreground">{flag.reason || '�'}</TableCell>
                <TableCell className="text-xs text-muted-foreground">{flag.updated_by || '�'}</TableCell>
                <TableCell>
                  <Button variant="ghost" size="icon" onClick={() => handleDelete(flag)} className="text-destructive hover:text-destructive">
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}

// 3. Country Feature Editor
function CountryEditor({ flags, adminEmail, onRefresh, initialCountry }: { 
  flags: FeatureFlag[]; adminEmail: string; onRefresh: () => void; initialCountry?: string 
}) {
  const [selectedCountry, setSelectedCountry] = useState(initialCountry || '');
  const [edits, setEdits] = useState<Record<string, { is_enabled: boolean; access_tier: string; reason: string }>>({});
  const [saving, setSaving] = useState(false);
  const [dirty, setDirty] = useState(false);

  // Build the full feature list for selected country
  const countryFlags = useMemo(() => {
    if (!selectedCountry) return [];
    const existing = flags.filter(f => f.country_code === selectedCountry);
    const existingMap = new Map(existing.map(f => [f.feature_key, f]));
    
    return ALL_FEATURE_KEYS.map(key => {
      const ex = existingMap.get(key);
      return {
        feature_key: key,
        is_enabled: ex?.is_enabled ?? true,
        access_tier: ex?.access_tier ?? 'all',
        reason: ex?.reason ?? '',
        id: ex?.id,
      };
    });
  }, [selectedCountry, flags]);

  // Reset edits when country changes
  useEffect(() => {
    setEdits({});
    setDirty(false);
  }, [selectedCountry]);

  const getVal = (key: string) => {
    if (edits[key]) return edits[key];
    const f = countryFlags.find(cf => cf.feature_key === key);
    return f ? { is_enabled: f.is_enabled, access_tier: f.access_tier, reason: f.reason } : { is_enabled: true, access_tier: 'all', reason: '' };
  };

  const updateEdit = (key: string, field: string, value: any) => {
    setDirty(true);
    setEdits(prev => ({
      ...prev,
      [key]: { ...getVal(key), [field]: value }
    }));
  };

  const handleSaveAll = async () => {
    if (!selectedCountry || !dirty) return;
    setSaving(true);
    try {
      // Build upsert payload for all modified rows
      const modifiedKeys = Object.keys(edits);
      if (modifiedKeys.length === 0) { setSaving(false); return; }

      const payload = modifiedKeys.map(key => ({
        country_code: selectedCountry,
        feature_key: key,
        is_enabled: edits[key].is_enabled,
        access_tier: edits[key].access_tier as 'all' | 'paid' | 'disabled',
        reason: edits[key].reason,
        updated_by: adminEmail,
        updated_at: new Date().toISOString(),
      }));

      await upsertFlags(payload);
      toast.success(`Saved ${payload.length} flag(s) for ${selectedCountry}`);
      setEdits({});
      setDirty(false);
      onRefresh();
    } catch (e: any) {
      toast.error(e.message);
    }
    setSaving(false);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-4">
        <Select value={selectedCountry} onValueChange={setSelectedCountry}>
          <SelectTrigger className="w-[250px]"><SelectValue placeholder="Select a country..." /></SelectTrigger>
          <SelectContent>
            {ALL_COUNTRIES.map(c => <SelectItem key={c.code} value={c.code}>{c.emoji} {c.name} ({c.code})</SelectItem>)}
          </SelectContent>
        </Select>

        {dirty && (
          <Button onClick={handleSaveAll} disabled={saving}>
            {saving ? <Loader2 className="w-4 h-4 mr-1 animate-spin" /> : <Save className="w-4 h-4 mr-1" />}
            Save All Changes
          </Button>
        )}
      </div>

      {!selectedCountry ? (
        <p className="text-muted-foreground text-center py-12">Select a country to manage its feature flags</p>
      ) : (
        <div className="border rounded-lg">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Feature</TableHead>
                <TableHead>Label</TableHead>
                <TableHead>Enabled</TableHead>
                <TableHead>Access Tier</TableHead>
                <TableHead>Reason</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {ALL_FEATURE_KEYS.map(key => {
                const val = getVal(key);
                return (
                  <TableRow key={key}>
                    <TableCell className="font-mono text-xs">{key}</TableCell>
                    <TableCell className="text-sm">{FEATURE_LABELS[key]}</TableCell>
                    <TableCell>
                      <Switch checked={val.is_enabled} onCheckedChange={v => updateEdit(key, 'is_enabled', v)} />
                    </TableCell>
                    <TableCell>
                      <Select value={val.access_tier} onValueChange={v => updateEdit(key, 'access_tier', v)}>
                        <SelectTrigger className="w-[100px] h-8 text-xs"><SelectValue /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">All</SelectItem>
                          <SelectItem value="paid">Paid</SelectItem>
                          <SelectItem value="disabled">Disabled</SelectItem>
                        </SelectContent>
                      </Select>
                    </TableCell>
                    <TableCell>
                      <Input 
                        value={val.reason} 
                        onChange={e => updateEdit(key, 'reason', e.target.value)} 
                        placeholder="Reason (optional)" 
                        className="h-8 text-xs"
                      />
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
}

// ============ MAIN COMPONENT ============
export default function FeatureFlagsTab() {
  const { user } = useAuth();
  const [flags, setFlags] = useState<FeatureFlag[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeView, setActiveView] = useState('overview');
  const [editorCountry, setEditorCountry] = useState<string | undefined>();

  const adminEmail = user?.email || 'admin';

  const loadFlags = useCallback(async () => {
    setLoading(true);
    try {
      const data = await fetchFlags();
      setFlags(data);
    } catch (e: any) {
      toast.error('Failed to load feature flags: ' + e.message);
    }
    setLoading(false);
  }, []);

  useEffect(() => { loadFlags(); }, [loadFlags]);

  const handleSelectCountry = (code: string) => {
    setEditorCountry(code);
    setActiveView('editor');
  };

  if (loading) {
    return (
      <Card><CardContent className="flex items-center justify-center py-12">
        <Loader2 className="w-6 h-6 animate-spin text-primary mr-2" />
        <span className="text-muted-foreground">Loading feature flags...</span>
      </CardContent></Card>
    );
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="flex items-center gap-2">
          <Flag className="w-5 h-5 text-secondary" />
          Feature Flags Management
        </CardTitle>
        <Button variant="outline" size="sm" onClick={loadFlags}>
          <RefreshCw className="w-4 h-4 mr-1" /> Refresh
        </Button>
      </CardHeader>
      <CardContent>
        <Tabs value={activeView} onValueChange={setActiveView}>
          <TabsList className="mb-4">
            <TabsTrigger value="overview">
              <BarChart3 className="w-4 h-4 mr-1" /> Overview
            </TabsTrigger>
            <TabsTrigger value="flags">
              <Eye className="w-4 h-4 mr-1" /> All Flags
            </TabsTrigger>
            <TabsTrigger value="editor">
              <Globe className="w-4 h-4 mr-1" /> Country Editor
            </TabsTrigger>
            <TabsTrigger value="access">
              <ShieldAlert className="w-4 h-4 mr-1" /> Country Access
            </TabsTrigger>
          </TabsList>

          <TabsContent value="overview">
            <FlagsDashboard flags={flags} onSelectCountry={handleSelectCountry} />
          </TabsContent>
          <TabsContent value="flags">
            <FlagsTable flags={flags} adminEmail={adminEmail} onRefresh={loadFlags} />
          </TabsContent>
          <TabsContent value="editor">
            <CountryEditor flags={flags} adminEmail={adminEmail} onRefresh={loadFlags} initialCountry={editorCountry} />
          </TabsContent>
          <TabsContent value="access">
            <CountryAccessManager />
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}
