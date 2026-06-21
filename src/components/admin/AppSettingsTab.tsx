import { useState, useEffect, useCallback, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Loader2, RefreshCw, Settings } from 'lucide-react';

interface SettingDef {
  key: string;
  label: string;
  description: string;
  type: 'text' | 'number' | 'boolean' | 'select' | 'url' | 'email';
  defaultValue: string;
  options?: { label: string; value: string }[];
  min?: number;
  max?: number;
  placeholder?: string;
}

interface AppSetting {
  id?: string;
  setting_key: string;
  setting_value: string;
  updated_at?: string;
  updated_by?: string | null;
}

const SETTING_DEFS: SettingDef[] = [
  {
    key: 'archive_retention_months',
    label: 'Archive Retention',
    description: 'Months before user health data is archived',
    type: 'number',
    defaultValue: '36',
    min: 1,
    max: 120,
  },
  {
    key: 'max_archive_records',
    label: 'Max Archive Records',
    description: 'Maximum records archived per run',
    type: 'number',
    defaultValue: '5000',
    min: 100,
    max: 50000,
  },
  {
    key: 'site_maintenance_mode',
    label: 'Maintenance Mode',
    description: 'Show maintenance page to non-admin users',
    type: 'boolean',
    defaultValue: 'false',
  },
  {
    key: 'signups_enabled',
    label: 'Enable Signups',
    description: 'Allow new user registration',
    type: 'boolean',
    defaultValue: 'true',
  },
  {
    key: 'default_site_url',
    label: 'Site URL',
    description: 'Base URL used in emails and redirects',
    type: 'url',
    defaultValue: 'https://sync365.app',
    placeholder: 'https://sync365.app',
  },
  {
    key: 'login_rate_limit_window',
    label: 'Login Rate Limit Window',
    description: 'Minutes for tracking repeated login attempts',
    type: 'number',
    defaultValue: '15',
    min: 1,
    max: 60,
  },
  {
    key: 'login_rate_limit_max',
    label: 'Max Login Attempts',
    description: 'Failed attempts before rate limiting kicks in',
    type: 'number',
    defaultValue: '5',
    min: 1,
    max: 20,
  },
  {
    key: 'ai_provider',
    label: 'AI Provider',
    description: 'AI model provider for chatbot and insights',
    type: 'select',
    defaultValue: 'openai',
    options: [
      { label: 'OpenAI', value: 'openai' },
      { label: 'Anthropic', value: 'anthropic' },
      { label: 'Google Gemini', value: 'gemini' },
    ],
  },
  {
    key: 'enable_ai_chatbot',
    label: 'AI Chatbot Enabled',
    description: 'Globally enable or disable the AI chatbot feature',
    type: 'boolean',
    defaultValue: 'true',
  },
  {
    key: 'pricing_tier_default',
    label: 'Default Pricing Tier',
    description: 'Default pricing tier for new countries',
    type: 'select',
    defaultValue: 'standard',
    options: [
      { label: 'Standard', value: 'standard' },
      { label: 'Premium', value: 'premium' },
      { label: 'Basic', value: 'basic' },
    ],
  },
  {
    key: 'admin_notification_email',
    label: 'Admin Notification Email',
    description: 'Email address for admin alerts and notifications',
    type: 'email',
    defaultValue: '',
    placeholder: 'admin@example.com',
  },
];

export default function AppSettingsTab() {
  const { user } = useAuth();
  const [settings, setSettings] = useState<AppSetting[]>([]);
  const [loading, setLoading] = useState(true);
  const [savingKey, setSavingKey] = useState<string | null>(null);
  const adminId = user?.id || '';
  const savingRef = useRef(false);

  const getDbValue = useCallback((key: string): string | undefined => {
    return settings.find(s => s.setting_key === key)?.setting_value;
  }, [settings]);

  const loadSettings = useCallback(async () => {
    setLoading(true);
    try {
      const { data: sessionData } = await supabase.auth.getSession();
      const response = await supabase.functions.invoke('external-db-query', {
        body: { table: 'app_settings', limit: 200, offset: 0 },
        headers: sessionData.session ? { Authorization: `Bearer ${sessionData.session.access_token}` } : {},
      });
      if (response.error) throw new Error(response.error.message);
      setSettings(response.data.data || []);
    } catch (e: any) {
      toast.error('Failed to load app settings: ' + e.message);
    }
    setLoading(false);
  }, []);

  useEffect(() => { loadSettings(); }, [loadSettings]);

  const save = useCallback(async (key: string, value: string) => {
    if (savingRef.current) return;
    savingRef.current = true;
    setSavingKey(key);
    try {
      const { data: sessionData } = await supabase.auth.getSession();
      const response = await supabase.functions.invoke('external-db-mutate', {
        body: {
          table: 'app_settings', operation: 'upsert',
          data: [{ setting_key: key, setting_value: value, updated_by: adminId || null }],
          onConflict: 'setting_key',
        },
        headers: sessionData.session ? { Authorization: `Bearer ${sessionData.session.access_token}` } : {},
      });
      if (response.error) throw new Error(response.error.message);
      await loadSettings();
    } catch (e: any) {
      toast.error(e.message);
    }
    setSavingKey(null);
    savingRef.current = false;
  }, [adminId, loadSettings]);

  const handleChange = useCallback(async (def: SettingDef, value: string) => {
    const current = getDbValue(def.key) ?? def.defaultValue;
    if (value === current) return;
    await save(def.key, value);
  }, [getDbValue, save]);

  const renderControl = (def: SettingDef) => {
    const val = getDbValue(def.key) ?? def.defaultValue;
    const isSaving = savingKey === def.key;

    switch (def.type) {
      case 'boolean':
        return (
          <div className="flex items-center gap-2">
            <Switch
              checked={val === 'true'}
              onCheckedChange={v => handleChange(def, v ? 'true' : 'false')}
              disabled={isSaving}
            />
            {isSaving && <Loader2 className="w-3 h-3 animate-spin text-muted-foreground" />}
          </div>
        );
      case 'number':
        return (
          <div className="flex items-center gap-2">
            <Input
              type="number"
              defaultValue={val}
              min={def.min}
              max={def.max}
              onBlur={e => {
                const newVal = e.target.value;
                if (newVal !== val) handleChange(def, newVal);
              }}
              onKeyDown={e => {
                if (e.key === 'Enter') {
                  const target = e.target as HTMLInputElement;
                  if (target.value !== val) handleChange(def, target.value);
                  target.blur();
                }
              }}
              className="h-8 text-xs w-28"
              disabled={isSaving}
            />
            {isSaving && <Loader2 className="w-3 h-3 animate-spin text-muted-foreground" />}
          </div>
        );
      case 'select':
        return (
          <div className="flex items-center gap-2">
            <Select
              value={val}
              onValueChange={v => handleChange(def, v)}
              disabled={isSaving}
            >
              <SelectTrigger className="w-40 h-8 text-xs"><SelectValue /></SelectTrigger>
              <SelectContent>
                {def.options?.map(o => (
                  <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            {isSaving && <Loader2 className="w-3 h-3 animate-spin text-muted-foreground" />}
          </div>
        );
      default:
        return (
          <div className="flex items-center gap-2">
            <Input
              type={def.type === 'email' ? 'email' : 'text'}
              defaultValue={val}
              onBlur={e => {
                const newVal = e.target.value;
                if (newVal !== val) handleChange(def, newVal);
              }}
              onKeyDown={e => {
                if (e.key === 'Enter') {
                  const target = e.target as HTMLInputElement;
                  if (target.value !== val) handleChange(def, target.value);
                  target.blur();
                }
              }}
              placeholder={def.placeholder}
              className="h-8 text-xs w-60"
              disabled={isSaving}
            />
            {isSaving && <Loader2 className="w-3 h-3 animate-spin text-muted-foreground" />}
          </div>
        );
    }
  };

  const resolved = (def: SettingDef) => {
    const db = settings.find(s => s.setting_key === def.key);
    return {
      def,
      inDb: !!db,
      currentValue: db?.setting_value ?? def.defaultValue,
    };
  };

  if (loading) {
    return (
      <Card><CardContent className="flex items-center justify-center py-12">
        <Loader2 className="w-6 h-6 animate-spin text-primary mr-2" />
        <span className="text-muted-foreground">Loading app settings...</span>
      </CardContent></Card>
    );
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="flex items-center gap-2">
          <Settings className="w-5 h-5 text-secondary" />
          App Settings
        </CardTitle>
        <Button variant="outline" size="sm" onClick={loadSettings}>
          <RefreshCw className="w-4 h-4 mr-1" /> Refresh
        </Button>
      </CardHeader>
      <CardContent>
        <div className="border rounded-lg">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[220px]">Setting</TableHead>
                <TableHead>Value</TableHead>
                <TableHead className="w-[100px]">Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {SETTING_DEFS.map(def => {
                const r = resolved(def);
                return (
                  <TableRow key={def.key}>
                    <TableCell>
                      <div className="font-medium text-sm">{def.label}</div>
                      <div className="text-xs text-muted-foreground">{def.description}</div>
                    </TableCell>
                    <TableCell>
                      {renderControl(def)}
                    </TableCell>
                    <TableCell>
                      {savingKey === def.key ? (
                        <Badge variant="outline" className="text-xs border-accent/30 text-accent">saving...</Badge>
                      ) : !r.inDb ? (
                        <Badge variant="outline" className="text-xs border-muted-foreground/30 text-muted-foreground">default</Badge>
                      ) : (
                        <Badge variant="outline" className="text-xs border-green-500/30 text-green-500">saved</Badge>
                      )}
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
}
