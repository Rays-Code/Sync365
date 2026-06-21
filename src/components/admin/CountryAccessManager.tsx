import { useState, useEffect, useCallback, useMemo } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter, DialogDescription } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Loader2, Plus, Search, ArrowUpDown, ShieldAlert, ShieldCheck } from 'lucide-react';

interface CountryAccess {
  id?: string;
  country_code: string;
  is_enabled: boolean;
  reason: string | null;
  updated_by: string | null;
  updated_at: string | null;
}

// ISO 3166-1 alpha-2 country list
const COUNTRIES: { code: string; name: string }[] = [
  { code: 'AF', name: 'Afghanistan' }, { code: 'AL', name: 'Albania' }, { code: 'DZ', name: 'Algeria' },
  { code: 'AD', name: 'Andorra' }, { code: 'AO', name: 'Angola' }, { code: 'AG', name: 'Antigua and Barbuda' },
  { code: 'AR', name: 'Argentina' }, { code: 'AM', name: 'Armenia' }, { code: 'AU', name: 'Australia' },
  { code: 'AT', name: 'Austria' }, { code: 'AZ', name: 'Azerbaijan' }, { code: 'BS', name: 'Bahamas' },
  { code: 'BH', name: 'Bahrain' }, { code: 'BD', name: 'Bangladesh' }, { code: 'BB', name: 'Barbados' },
  { code: 'BY', name: 'Belarus' }, { code: 'BE', name: 'Belgium' }, { code: 'BZ', name: 'Belize' },
  { code: 'BJ', name: 'Benin' }, { code: 'BT', name: 'Bhutan' }, { code: 'BO', name: 'Bolivia' },
  { code: 'BA', name: 'Bosnia and Herzegovina' }, { code: 'BW', name: 'Botswana' }, { code: 'BR', name: 'Brazil' },
  { code: 'BN', name: 'Brunei' }, { code: 'BG', name: 'Bulgaria' }, { code: 'BF', name: 'Burkina Faso' },
  { code: 'BI', name: 'Burundi' }, { code: 'KH', name: 'Cambodia' }, { code: 'CM', name: 'Cameroon' },
  { code: 'CA', name: 'Canada' }, { code: 'CV', name: 'Cape Verde' }, { code: 'CF', name: 'Central African Republic' },
  { code: 'TD', name: 'Chad' }, { code: 'CL', name: 'Chile' }, { code: 'CN', name: 'China' },
  { code: 'CO', name: 'Colombia' }, { code: 'KM', name: 'Comoros' }, { code: 'CG', name: 'Congo' },
  { code: 'CR', name: 'Costa Rica' }, { code: 'HR', name: 'Croatia' }, { code: 'CU', name: 'Cuba' },
  { code: 'CY', name: 'Cyprus' }, { code: 'CZ', name: 'Czech Republic' }, { code: 'DK', name: 'Denmark' },
  { code: 'DJ', name: 'Djibouti' }, { code: 'DM', name: 'Dominica' }, { code: 'DO', name: 'Dominican Republic' },
  { code: 'EC', name: 'Ecuador' }, { code: 'EG', name: 'Egypt' }, { code: 'SV', name: 'El Salvador' },
  { code: 'GQ', name: 'Equatorial Guinea' }, { code: 'ER', name: 'Eritrea' }, { code: 'EE', name: 'Estonia' },
  { code: 'ET', name: 'Ethiopia' }, { code: 'FJ', name: 'Fiji' }, { code: 'FI', name: 'Finland' },
  { code: 'FR', name: 'France' }, { code: 'GA', name: 'Gabon' }, { code: 'GM', name: 'Gambia' },
  { code: 'GE', name: 'Georgia' }, { code: 'DE', name: 'Germany' }, { code: 'GH', name: 'Ghana' },
  { code: 'GR', name: 'Greece' }, { code: 'GD', name: 'Grenada' }, { code: 'GT', name: 'Guatemala' },
  { code: 'GN', name: 'Guinea' }, { code: 'GW', name: 'Guinea-Bissau' }, { code: 'GY', name: 'Guyana' },
  { code: 'HT', name: 'Haiti' }, { code: 'HN', name: 'Honduras' }, { code: 'HU', name: 'Hungary' },
  { code: 'IS', name: 'Iceland' }, { code: 'IN', name: 'India' }, { code: 'ID', name: 'Indonesia' },
  { code: 'IR', name: 'Iran' }, { code: 'IQ', name: 'Iraq' }, { code: 'IE', name: 'Ireland' },
  { code: 'IL', name: 'Israel' }, { code: 'IT', name: 'Italy' }, { code: 'JM', name: 'Jamaica' },
  { code: 'JP', name: 'Japan' }, { code: 'JO', name: 'Jordan' }, { code: 'KZ', name: 'Kazakhstan' },
  { code: 'KE', name: 'Kenya' }, { code: 'KI', name: 'Kiribati' }, { code: 'KW', name: 'Kuwait' },
  { code: 'KG', name: 'Kyrgyzstan' }, { code: 'LA', name: 'Laos' }, { code: 'LV', name: 'Latvia' },
  { code: 'LB', name: 'Lebanon' }, { code: 'LS', name: 'Lesotho' }, { code: 'LR', name: 'Liberia' },
  { code: 'LY', name: 'Libya' }, { code: 'LI', name: 'Liechtenstein' }, { code: 'LT', name: 'Lithuania' },
  { code: 'LU', name: 'Luxembourg' }, { code: 'MG', name: 'Madagascar' }, { code: 'MW', name: 'Malawi' },
  { code: 'MY', name: 'Malaysia' }, { code: 'MV', name: 'Maldives' }, { code: 'ML', name: 'Mali' },
  { code: 'MT', name: 'Malta' }, { code: 'MH', name: 'Marshall Islands' }, { code: 'MR', name: 'Mauritania' },
  { code: 'MU', name: 'Mauritius' }, { code: 'MX', name: 'Mexico' }, { code: 'FM', name: 'Micronesia' },
  { code: 'MD', name: 'Moldova' }, { code: 'MC', name: 'Monaco' }, { code: 'MN', name: 'Mongolia' },
  { code: 'ME', name: 'Montenegro' }, { code: 'MA', name: 'Morocco' }, { code: 'MZ', name: 'Mozambique' },
  { code: 'MM', name: 'Myanmar' }, { code: 'NA', name: 'Namibia' }, { code: 'NR', name: 'Nauru' },
  { code: 'NP', name: 'Nepal' }, { code: 'NL', name: 'Netherlands' }, { code: 'NZ', name: 'New Zealand' },
  { code: 'NI', name: 'Nicaragua' }, { code: 'NE', name: 'Niger' }, { code: 'NG', name: 'Nigeria' },
  { code: 'KP', name: 'North Korea' }, { code: 'MK', name: 'North Macedonia' }, { code: 'NO', name: 'Norway' },
  { code: 'OM', name: 'Oman' }, { code: 'PK', name: 'Pakistan' }, { code: 'PW', name: 'Palau' },
  { code: 'PA', name: 'Panama' }, { code: 'PG', name: 'Papua New Guinea' }, { code: 'PY', name: 'Paraguay' },
  { code: 'PE', name: 'Peru' }, { code: 'PH', name: 'Philippines' }, { code: 'PL', name: 'Poland' },
  { code: 'PT', name: 'Portugal' }, { code: 'QA', name: 'Qatar' }, { code: 'RO', name: 'Romania' },
  { code: 'RU', name: 'Russia' }, { code: 'RW', name: 'Rwanda' }, { code: 'KN', name: 'Saint Kitts and Nevis' },
  { code: 'LC', name: 'Saint Lucia' }, { code: 'VC', name: 'Saint Vincent' }, { code: 'WS', name: 'Samoa' },
  { code: 'SM', name: 'San Marino' }, { code: 'ST', name: 'S�o Tom� and Pr�ncipe' }, { code: 'SA', name: 'Saudi Arabia' },
  { code: 'SN', name: 'Senegal' }, { code: 'RS', name: 'Serbia' }, { code: 'SC', name: 'Seychelles' },
  { code: 'SL', name: 'Sierra Leone' }, { code: 'SG', name: 'Singapore' }, { code: 'SK', name: 'Slovakia' },
  { code: 'SI', name: 'Slovenia' }, { code: 'SB', name: 'Solomon Islands' }, { code: 'SO', name: 'Somalia' },
  { code: 'ZA', name: 'South Africa' }, { code: 'KR', name: 'South Korea' }, { code: 'SS', name: 'South Sudan' },
  { code: 'ES', name: 'Spain' }, { code: 'LK', name: 'Sri Lanka' }, { code: 'SD', name: 'Sudan' },
  { code: 'SR', name: 'Suriname' }, { code: 'SE', name: 'Sweden' }, { code: 'CH', name: 'Switzerland' },
  { code: 'SY', name: 'Syria' }, { code: 'TW', name: 'Taiwan' }, { code: 'TJ', name: 'Tajikistan' },
  { code: 'TZ', name: 'Tanzania' }, { code: 'TH', name: 'Thailand' }, { code: 'TL', name: 'Timor-Leste' },
  { code: 'TG', name: 'Togo' }, { code: 'TO', name: 'Tonga' }, { code: 'TT', name: 'Trinidad and Tobago' },
  { code: 'TN', name: 'Tunisia' }, { code: 'TR', name: 'Turkey' }, { code: 'TM', name: 'Turkmenistan' },
  { code: 'TV', name: 'Tuvalu' }, { code: 'UG', name: 'Uganda' }, { code: 'UA', name: 'Ukraine' },
  { code: 'AE', name: 'UAE' }, { code: 'GB', name: 'United Kingdom' }, { code: 'US', name: 'United States' },
  { code: 'UY', name: 'Uruguay' }, { code: 'UZ', name: 'Uzbekistan' }, { code: 'VU', name: 'Vanuatu' },
  { code: 'VE', name: 'Venezuela' }, { code: 'VN', name: 'Vietnam' }, { code: 'YE', name: 'Yemen' },
  { code: 'ZM', name: 'Zambia' }, { code: 'ZW', name: 'Zimbabwe' },
];

const getCountryName = (code: string) => COUNTRIES.find(c => c.code === code)?.name || code;

async function fetchCountryAccess(): Promise<CountryAccess[]> {
  const { data: sessionData } = await supabase.auth.getSession();
  const response = await supabase.functions.invoke('external-db-query', {
    body: { table: 'country_access', limit: 500, offset: 0 },
    headers: sessionData.session ? { Authorization: `Bearer ${sessionData.session.access_token}` } : {},
  });
  if (response.error) throw new Error(response.error.message);
  return (response.data.data || []).map((r: any) => ({
    id: r.country_code,
    country_code: r.country_code,
    is_enabled: r.is_allowed,
    reason: r.block_message,
    updated_by: r.updated_by || '',
    updated_at: r.updated_at || '',
  }));
}

async function upsertCountryAccess(rows: Partial<CountryAccess>[], onConflict = 'country_code') {
  const { data: sessionData } = await supabase.auth.getSession();
  const dbRows = rows.map(({ is_enabled, reason, ...rest }) => ({
    ...rest,
    is_allowed: is_enabled,
    block_message: reason,
  }));
  const response = await supabase.functions.invoke('external-db-mutate', {
    body: { table: 'country_access', operation: 'upsert', data: dbRows, onConflict },
    headers: sessionData.session ? { Authorization: `Bearer ${sessionData.session.access_token}` } : {},
  });
  if (response.error) throw new Error(response.error.message);
  return response.data;
}

export default function CountryAccessManager() {
  const { user } = useAuth();
  const adminEmail = user?.email || 'admin';

  const [rows, setRows] = useState<CountryAccess[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [sortField, setSortField] = useState<'country_code' | 'is_enabled' | 'updated_at'>('country_code');
  const [sortAsc, setSortAsc] = useState(true);
  const [selected, setSelected] = useState<Set<string>>(new Set());

  // Add country modal
  const [addOpen, setAddOpen] = useState(false);
  const [newCountry, setNewCountry] = useState('');
  const [newEnabled, setNewEnabled] = useState(true);
  const [newReason, setNewReason] = useState('');

  // Disable confirmation
  const [disableConfirm, setDisableConfirm] = useState<{ countryCode: string; countryName: string; isBulk?: boolean; codes?: string[] } | null>(null);
  const [pendingToggle, setPendingToggle] = useState<CountryAccess | null>(null);

  // Bulk action
  const [bulkAction, setBulkAction] = useState<'enable' | 'disable' | null>(null);
  const [bulkReason, setBulkReason] = useState('');
  const [bulkDialogOpen, setBulkDialogOpen] = useState(false);

  // Inline edit reasons
  const [editingReason, setEditingReason] = useState<Record<string, string>>({});
  const [savingReason, setSavingReason] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const data = await fetchCountryAccess();
      setRows(data);
    } catch (e: any) {
      toast.error('Failed to load country access: ' + e.message);
    }
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  const filtered = useMemo(() => {
    let result = rows.filter(r => {
      const name = getCountryName(r.country_code).toLowerCase();
      const q = search.toLowerCase();
      return r.country_code.toLowerCase().includes(q) || name.includes(q) || (r.reason || '').toLowerCase().includes(q);
    });
    result.sort((a, b) => {
      let cmp = 0;
      if (sortField === 'country_code') cmp = a.country_code.localeCompare(b.country_code);
      else if (sortField === 'is_enabled') cmp = (a.is_enabled === b.is_enabled ? 0 : a.is_enabled ? -1 : 1);
      else if (sortField === 'updated_at') cmp = (a.updated_at || '').localeCompare(b.updated_at || '');
      return sortAsc ? cmp : -cmp;
    });
    return result;
  }, [rows, search, sortField, sortAsc]);

  const toggleSort = (field: typeof sortField) => {
    if (sortField === field) setSortAsc(!sortAsc);
    else { setSortField(field); setSortAsc(true); }
  };

  const handleToggle = (row: CountryAccess) => {
    if (row.is_enabled) {
      // Disabling � show confirmation
      setDisableConfirm({ countryCode: row.country_code, countryName: getCountryName(row.country_code) });
      setPendingToggle(row);
    } else {
      // Enabling � just do it
      doToggle(row, true);
    }
  };

  const doToggle = async (row: CountryAccess, newValue: boolean) => {
    try {
      await upsertCountryAccess([{
        country_code: row.country_code,
        is_enabled: newValue,
        reason: row.reason,
        updated_by: adminEmail,
        updated_at: new Date().toISOString(),
      }]);
      toast.success(`${getCountryName(row.country_code)} ${newValue ? 'enabled' : 'disabled'}`);
      load();
    } catch (e: any) {
      toast.error(e.message);
    }
  };

  const confirmDisable = () => {
    if (pendingToggle) {
      doToggle(pendingToggle, false);
      setPendingToggle(null);
    }
    setDisableConfirm(null);
  };

  const handleAddCountry = async () => {
    if (!newCountry) return;
    if (!newEnabled) {
      setDisableConfirm({
        countryCode: newCountry,
        countryName: getCountryName(newCountry),
      });
      setPendingToggle({ country_code: newCountry, is_enabled: false, reason: newReason, updated_by: adminEmail, updated_at: new Date().toISOString() });
      // We'll handle the actual insert in confirmDisable by overriding the flow
      return;
    }
    await doAddCountry();
  };

  const doAddCountry = async () => {
    try {
      await upsertCountryAccess([{
        country_code: newCountry,
        is_enabled: newEnabled,
        reason: newReason || null,
        updated_by: adminEmail,
        updated_at: new Date().toISOString(),
      }]);
      toast.success(`${getCountryName(newCountry)} added`);
      setAddOpen(false);
      setNewCountry('');
      setNewEnabled(true);
      setNewReason('');
      load();
    } catch (e: any) {
      toast.error(e.message);
    }
  };

  const handleSaveReason = async (row: CountryAccess) => {
    const reason = editingReason[row.country_code];
    if (reason === undefined) return;
    setSavingReason(row.country_code);
    try {
      await upsertCountryAccess([{
        country_code: row.country_code,
        is_enabled: row.is_enabled,
        reason,
        updated_by: adminEmail,
        updated_at: new Date().toISOString(),
      }]);
      toast.success('Reason updated');
      setEditingReason(prev => { const n = { ...prev }; delete n[row.country_code]; return n; });
      load();
    } catch (e: any) {
      toast.error(e.message);
    }
    setSavingReason(null);
  };

  // Bulk actions
  const handleBulkOpen = (action: 'enable' | 'disable') => {
    setBulkAction(action);
    setBulkReason('');
    if (action === 'disable') {
      const names = [...selected].map(getCountryName).join(', ');
      setDisableConfirm({ countryCode: '', countryName: names, isBulk: true, codes: [...selected] });
    } else {
      setBulkDialogOpen(true);
    }
  };

  const executeBulk = async (enable: boolean, reason: string) => {
    const codes = [...selected];
    try {
      const payload = codes.map(code => ({
        country_code: code,
        is_enabled: enable,
        reason: reason || null,
        updated_by: adminEmail,
        updated_at: new Date().toISOString(),
      }));
      await upsertCountryAccess(payload);
      toast.success(`${codes.length} countries ${enable ? 'enabled' : 'disabled'}`);
      setSelected(new Set());
      setBulkDialogOpen(false);
      load();
    } catch (e: any) {
      toast.error(e.message);
    }
  };

  const allSelected = filtered.length > 0 && filtered.every(r => selected.has(r.country_code));

  const enabledCount = rows.filter(r => r.is_enabled).length;
  const disabledCount = rows.filter(r => !r.is_enabled).length;

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-6 h-6 animate-spin text-primary mr-2" />
        <span className="text-muted-foreground">Loading country access...</span>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Summary */}
      <div className="flex gap-4 flex-wrap">
        <Badge variant="outline" className="text-foreground border-border">
          {rows.length} countries
        </Badge>
        <Badge variant="outline" className="text-green-500 border-green-500/30">
          <ShieldCheck className="w-3 h-3 mr-1" /> {enabledCount} enabled
        </Badge>
        <Badge variant="outline" className="text-destructive border-destructive/30">
          <ShieldAlert className="w-3 h-3 mr-1" /> {disabledCount} disabled
        </Badge>
      </div>

      {/* Toolbar */}
      <div className="flex flex-wrap gap-3 items-center">
        <div className="relative flex-1 min-w-[200px] max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search country or reason..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>

        <Dialog open={addOpen} onOpenChange={setAddOpen}>
          <DialogTrigger asChild>
            <Button size="sm"><Plus className="w-4 h-4 mr-1" /> Add Country</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add Country Access</DialogTitle>
              <DialogDescription>Configure access for a new country.</DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label>Country</Label>
                <Select value={newCountry} onValueChange={setNewCountry}>
                  <SelectTrigger><SelectValue placeholder="Select country..." /></SelectTrigger>
                  <SelectContent className="max-h-[300px]">
                    {COUNTRIES.filter(c => !rows.some(r => r.country_code === c.code)).map(c => (
                      <SelectItem key={c.code} value={c.code}>{c.name} ({c.code})</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="flex items-center gap-3">
                <Label>Enabled</Label>
                <Switch checked={newEnabled} onCheckedChange={setNewEnabled} />
                <span className={`text-xs font-medium ${newEnabled ? 'text-green-500' : 'text-destructive'}`}>
                  {newEnabled ? 'Allowed' : 'Blocked'}
                </span>
              </div>
              <div>
                <Label>Reason</Label>
                <Input value={newReason} onChange={e => setNewReason(e.target.value)} placeholder="e.g. Regulatory compliance" />
              </div>
              <Button onClick={handleAddCountry} className="w-full" disabled={!newCountry}>
                Add Country
              </Button>
            </div>
          </DialogContent>
        </Dialog>

        {selected.size > 0 && (
          <div className="flex gap-2 items-center">
            <span className="text-xs text-muted-foreground">{selected.size} selected</span>
            <Button size="sm" variant="outline" onClick={() => handleBulkOpen('enable')} className="text-green-500 border-green-500/30 hover:bg-green-500/10">
              Enable All
            </Button>
            <Button size="sm" variant="outline" onClick={() => handleBulkOpen('disable')} className="text-destructive border-destructive/30 hover:bg-destructive/10">
              Disable All
            </Button>
          </div>
        )}
      </div>

      {/* Table */}
      <div className="border rounded-lg">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-10">
                <Checkbox
                  checked={allSelected}
                  onCheckedChange={v => {
                    if (v) setSelected(new Set(filtered.map(r => r.country_code)));
                    else setSelected(new Set());
                  }}
                />
              </TableHead>
              <TableHead className="cursor-pointer" onClick={() => toggleSort('country_code')}>
                <div className="flex items-center gap-1">Country <ArrowUpDown className="w-3 h-3" /></div>
              </TableHead>
              <TableHead className="cursor-pointer" onClick={() => toggleSort('is_enabled')}>
                <div className="flex items-center gap-1">Status <ArrowUpDown className="w-3 h-3" /></div>
              </TableHead>
              <TableHead>Reason</TableHead>
              <TableHead>Updated By</TableHead>
              <TableHead className="cursor-pointer" onClick={() => toggleSort('updated_at')}>
                <div className="flex items-center gap-1">Updated At <ArrowUpDown className="w-3 h-3" /></div>
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.length === 0 && (
              <TableRow>
                <TableCell colSpan={6} className="text-center text-muted-foreground py-8">
                  {search ? 'No countries match your search' : 'No countries configured. Click "Add Country" to get started.'}
                </TableCell>
              </TableRow>
            )}
            {filtered.map(row => {
              const isEditing = editingReason[row.country_code] !== undefined;
              return (
                <TableRow key={row.country_code}>
                  <TableCell>
                    <Checkbox
                      checked={selected.has(row.country_code)}
                      onCheckedChange={v => {
                        const next = new Set(selected);
                        if (v) next.add(row.country_code); else next.delete(row.country_code);
                        setSelected(next);
                      }}
                    />
                  </TableCell>
                  <TableCell className="font-medium">
                    {getCountryName(row.country_code)} <span className="text-muted-foreground text-xs">({row.country_code})</span>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Switch
                        checked={row.is_enabled}
                        onCheckedChange={() => handleToggle(row)}
                        className={row.is_enabled ? 'data-[state=checked]:bg-green-500' : 'data-[state=unchecked]:bg-destructive'}
                      />
                      <span className={`text-xs font-medium ${row.is_enabled ? 'text-green-500' : 'text-destructive'}`}>
                        {row.is_enabled ? 'Enabled' : 'Blocked'}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell className="max-w-[250px]">
                    {isEditing ? (
                      <div className="flex gap-1">
                        <Input
                          value={editingReason[row.country_code]}
                          onChange={e => setEditingReason(prev => ({ ...prev, [row.country_code]: e.target.value }))}
                          className="h-7 text-xs"
                          onKeyDown={e => e.key === 'Enter' && handleSaveReason(row)}
                        />
                        <Button size="sm" variant="ghost" className="h-7 px-2 text-xs" onClick={() => handleSaveReason(row)} disabled={savingReason === row.country_code}>
                          {savingReason === row.country_code ? <Loader2 className="w-3 h-3 animate-spin" /> : 'Save'}
                        </Button>
                        <Button size="sm" variant="ghost" className="h-7 px-2 text-xs text-muted-foreground" onClick={() => setEditingReason(prev => { const n = { ...prev }; delete n[row.country_code]; return n; })}>
                          ?
                        </Button>
                      </div>
                    ) : (
                      <span
                        className="text-xs text-muted-foreground cursor-pointer hover:text-foreground transition-colors"
                        onClick={() => setEditingReason(prev => ({ ...prev, [row.country_code]: row.reason || '' }))}
                        title="Click to edit"
                      >
                        {row.reason || <span className="italic">Click to add reason</span>}
                      </span>
                    )}
                  </TableCell>
                  <TableCell className="text-xs text-muted-foreground">{row.updated_by || '�'}</TableCell>
                  <TableCell className="text-xs text-muted-foreground">
                    {row.updated_at ? new Date(row.updated_at).toLocaleDateString('en-AU', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' }) : '�'}
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>

      {/* Disable Confirmation */}
      <AlertDialog open={!!disableConfirm} onOpenChange={v => { if (!v) { setDisableConfirm(null); setPendingToggle(null); } }}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2 text-destructive">
              <ShieldAlert className="w-5 h-5" /> Confirm Country Block
            </AlertDialogTitle>
            <AlertDialogDescription>
              {disableConfirm?.isBulk
                ? `Users in the following countries will be blocked from using the app and purchasing subscriptions: ${disableConfirm.countryName}. Are you sure?`
                : `Users in ${disableConfirm?.countryName} will be blocked from using the app and purchasing subscriptions. Are you sure?`
              }
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              onClick={() => {
                if (disableConfirm?.isBulk && disableConfirm.codes) {
                  executeBulk(false, bulkReason);
                } else if (pendingToggle && pendingToggle.country_code === (disableConfirm?.countryCode || '')) {
                  // Check if it's from the add modal
                  if (addOpen) {
                    doAddCountry();
                  } else {
                    confirmDisable();
                  }
                } else {
                  confirmDisable();
                }
                setDisableConfirm(null);
              }}
            >
              Yes, Block Country
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Bulk Enable Dialog */}
      <Dialog open={bulkDialogOpen} onOpenChange={setBulkDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Bulk Enable Countries</DialogTitle>
            <DialogDescription>Enable {selected.size} selected countries.</DialogDescription>
          </DialogHeader>
          <div className="space-y-3">
            <div>
              <Label>Reason (optional)</Label>
              <Input value={bulkReason} onChange={e => setBulkReason(e.target.value)} placeholder="e.g. Market expansion" />
            </div>
            <Button className="w-full" onClick={() => executeBulk(true, bulkReason)}>
              Enable {selected.size} Countries
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
