import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Loader2, Plus, Save, RefreshCw, Search, Pencil } from 'lucide-react';

interface IvfCostEstimate {
  id: string;
  country: string;
  treatment_type: string;
  min_cost: number | null;
  max_cost: number | null;
  medicare_rebate: number | null;
  out_of_pocket_min: number | null;
  out_of_pocket_max: number | null;
  insurance_discount: number | null;
  currency: string;
  notes: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

const TREATMENT_TYPES = [
  'ivf_standard', 'ivf_icsi', 'iui', 'egg_freezing', 'consultation',
  'blood_tests', 'medication', 'pgd_pgt', 'embryo_freezing',
  'donor_egg', 'donor_sperm', 'surrogacy'
];

const COUNTRIES = [
  { code: 'AU', name: 'Australia', currency: 'AUD' },
  { code: 'IN', name: 'India', currency: 'INR' },
  { code: 'PK', name: 'Pakistan', currency: 'PKR' },
  { code: 'US', name: 'United States', currency: 'USD' },
  { code: 'GB', name: 'United Kingdom', currency: 'GBP' },
  { code: 'NZ', name: 'New Zealand', currency: 'NZD' },
  { code: 'CA', name: 'Canada', currency: 'CAD' },
  { code: 'SG', name: 'Singapore', currency: 'SGD' },
  { code: 'AE', name: 'UAE', currency: 'AED' },
];

export default function IvfCostManager() {
  const [estimates, setEstimates] = useState<IvfCostEstimate[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [search, setSearch] = useState('');
  const [filterCountry, setFilterCountry] = useState('all');
  const [editItem, setEditItem] = useState<IvfCostEstimate | null>(null);
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [newItem, setNewItem] = useState<Partial<IvfCostEstimate>>({
    country: 'AU', treatment_type: 'ivf_standard', currency: 'AUD', is_active: true
  });

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const { data: sessionData } = await supabase.auth.getSession();
      const response = await supabase.functions.invoke('external-db-query', {
        body: { table: 'ivf_cost_estimates', limit: 500 },
        headers: sessionData.session ? { Authorization: `Bearer ${sessionData.session.access_token}` } : {},
      });
      if (response.error) throw new Error(response.error.message);
      setEstimates(response.data.data || []);
    } catch (err: any) {
      toast.error('Failed to fetch IVF cost data');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  const handleSave = async (item: IvfCostEstimate) => {
    setSaving(true);
    try {
      const { data: sessionData } = await supabase.auth.getSession();
      const { id, created_at, updated_at, ...updateData } = item;
      const response = await supabase.functions.invoke('external-db-mutate', {
        body: { table: 'ivf_cost_estimates', operation: 'update', id, data: { ...updateData, updated_at: new Date().toISOString() } },
        headers: sessionData.session ? { Authorization: `Bearer ${sessionData.session.access_token}` } : {},
      });
      if (response.error) throw new Error(response.error.message);
      toast.success('Cost estimate updated');
      setEditItem(null);
      fetchData();
    } catch (err: any) {
      toast.error('Failed to update: ' + err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleAdd = async () => {
    setSaving(true);
    try {
      const { data: sessionData } = await supabase.auth.getSession();
      const response = await supabase.functions.invoke('external-db-mutate', {
        body: { table: 'ivf_cost_estimates', operation: 'insert', data: newItem },
        headers: sessionData.session ? { Authorization: `Bearer ${sessionData.session.access_token}` } : {},
      });
      if (response.error) throw new Error(response.error.message);
      toast.success('Cost estimate added');
      setShowAddDialog(false);
      setNewItem({ country: 'AU', treatment_type: 'ivf_standard', currency: 'AUD', is_active: true });
      fetchData();
    } catch (err: any) {
      toast.error('Failed to add: ' + err.message);
    } finally {
      setSaving(false);
    }
  };

  const filtered = estimates.filter(e => {
    const matchesSearch = !search || e.treatment_type.toLowerCase().includes(search.toLowerCase()) || e.country?.toLowerCase().includes(search.toLowerCase());
    const matchesCountry = filterCountry === 'all' || e.country === filterCountry;
    return matchesSearch && matchesCountry;
  });

  if (loading) {
    return <div className="flex justify-center py-12"><Loader2 className="w-6 h-6 animate-spin text-primary" /></div>;
  }

  return (
    <Card className="bg-card/50 border-border/50">
      <CardHeader>
        <div className="flex items-center justify-between flex-wrap gap-4">
          <CardTitle className="text-foreground">IVF Cost Estimates ({estimates.length})</CardTitle>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={fetchData}><RefreshCw className="w-4 h-4 mr-1" />Refresh</Button>
            <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
              <DialogTrigger asChild>
                <Button size="sm"><Plus className="w-4 h-4 mr-1" />Add Estimate</Button>
              </DialogTrigger>
              <DialogContent className="max-w-lg">
                <DialogHeader><DialogTitle>Add Cost Estimate</DialogTitle></DialogHeader>
                <div className="grid gap-3">
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <Label>Country</Label>
                      <Select value={newItem.country} onValueChange={v => setNewItem(p => ({ ...p, country: v, currency: COUNTRIES.find(c => c.code === v)?.currency || 'AUD' }))}>
                        <SelectTrigger><SelectValue /></SelectTrigger>
                        <SelectContent>{COUNTRIES.map(c => <SelectItem key={c.code} value={c.code}>{c.name}</SelectItem>)}</SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label>Treatment Type</Label>
                      <Select value={newItem.treatment_type} onValueChange={v => setNewItem(p => ({ ...p, treatment_type: v }))}>
                        <SelectTrigger><SelectValue /></SelectTrigger>
                        <SelectContent>{TREATMENT_TYPES.map(t => <SelectItem key={t} value={t}>{t.replace(/_/g, ' ')}</SelectItem>)}</SelectContent>
                      </Select>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div><Label>Min Cost</Label><Input type="number" value={newItem.min_cost ?? ''} onChange={e => setNewItem(p => ({ ...p, min_cost: e.target.value ? Number(e.target.value) : null }))} /></div>
                    <div><Label>Max Cost</Label><Input type="number" value={newItem.max_cost ?? ''} onChange={e => setNewItem(p => ({ ...p, max_cost: e.target.value ? Number(e.target.value) : null }))} /></div>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div><Label>Medicare Rebate</Label><Input type="number" value={newItem.medicare_rebate ?? ''} onChange={e => setNewItem(p => ({ ...p, medicare_rebate: e.target.value ? Number(e.target.value) : null }))} /></div>
                    <div><Label>Insurance Discount %</Label><Input type="number" value={newItem.insurance_discount ?? ''} onChange={e => setNewItem(p => ({ ...p, insurance_discount: e.target.value ? Number(e.target.value) : null }))} /></div>
                  </div>
                  <div><Label>Notes</Label><Textarea value={newItem.notes ?? ''} onChange={e => setNewItem(p => ({ ...p, notes: e.target.value }))} /></div>
                </div>
                <DialogFooter>
                  <Button onClick={handleAdd} disabled={saving}>{saving && <Loader2 className="w-4 h-4 mr-1 animate-spin" />}Add</Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        </div>
        <div className="flex items-center gap-3 mt-4">
          <div className="relative flex-1 max-w-xs">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input placeholder="Search treatment or country..." value={search} onChange={e => setSearch(e.target.value)} className="pl-9" />
          </div>
          <Select value={filterCountry} onValueChange={setFilterCountry}>
            <SelectTrigger className="w-40"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Countries</SelectItem>
              {COUNTRIES.map(c => <SelectItem key={c.code} value={c.code}>{c.name}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>
      </CardHeader>
      <CardContent>
        <div className="overflow-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Country</TableHead>
                <TableHead>Treatment</TableHead>
                <TableHead>Min Cost</TableHead>
                <TableHead>Max Cost</TableHead>
                <TableHead>Currency</TableHead>
                <TableHead>Active</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map(est => (
                <TableRow key={est.id}>
                  <TableCell><Badge variant="outline">{est.country}</Badge></TableCell>
                  <TableCell className="capitalize">{est.treatment_type?.replace(/_/g, ' ')}</TableCell>
                  <TableCell>{est.min_cost?.toLocaleString() ?? '�'}</TableCell>
                  <TableCell>{est.max_cost?.toLocaleString() ?? '�'}</TableCell>
                  <TableCell>{est.currency}</TableCell>
                  <TableCell><Badge variant={est.is_active ? 'default' : 'secondary'}>{est.is_active ? 'Yes' : 'No'}</Badge></TableCell>
                  <TableCell>
                    <Button variant="ghost" size="sm" onClick={() => setEditItem(est)}><Pencil className="w-4 h-4" /></Button>
                  </TableCell>
                </TableRow>
              ))}
              {filtered.length === 0 && (
                <TableRow><TableCell colSpan={7} className="text-center text-muted-foreground py-8">No estimates found</TableCell></TableRow>
              )}
            </TableBody>
          </Table>
        </div>

        {/* Edit Dialog */}
        <Dialog open={!!editItem} onOpenChange={open => !open && setEditItem(null)}>
          <DialogContent className="max-w-lg">
            <DialogHeader><DialogTitle>Edit Cost Estimate</DialogTitle></DialogHeader>
            {editItem && (
              <div className="grid gap-3">
                <div className="grid grid-cols-2 gap-3">
                  <div><Label>Country</Label><Input value={editItem.country} disabled /></div>
                  <div><Label>Treatment</Label><Input value={editItem.treatment_type} disabled /></div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div><Label>Min Cost</Label><Input type="number" value={editItem.min_cost ?? ''} onChange={e => setEditItem(p => p ? { ...p, min_cost: e.target.value ? Number(e.target.value) : null } : null)} /></div>
                  <div><Label>Max Cost</Label><Input type="number" value={editItem.max_cost ?? ''} onChange={e => setEditItem(p => p ? { ...p, max_cost: e.target.value ? Number(e.target.value) : null } : null)} /></div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div><Label>Out of Pocket Min</Label><Input type="number" value={editItem.out_of_pocket_min ?? ''} onChange={e => setEditItem(p => p ? { ...p, out_of_pocket_min: e.target.value ? Number(e.target.value) : null } : null)} /></div>
                  <div><Label>Out of Pocket Max</Label><Input type="number" value={editItem.out_of_pocket_max ?? ''} onChange={e => setEditItem(p => p ? { ...p, out_of_pocket_max: e.target.value ? Number(e.target.value) : null } : null)} /></div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div><Label>Medicare Rebate</Label><Input type="number" value={editItem.medicare_rebate ?? ''} onChange={e => setEditItem(p => p ? { ...p, medicare_rebate: e.target.value ? Number(e.target.value) : null } : null)} /></div>
                  <div><Label>Insurance Discount %</Label><Input type="number" value={editItem.insurance_discount ?? ''} onChange={e => setEditItem(p => p ? { ...p, insurance_discount: e.target.value ? Number(e.target.value) : null } : null)} /></div>
                </div>
                <div><Label>Currency</Label><Input value={editItem.currency} onChange={e => setEditItem(p => p ? { ...p, currency: e.target.value } : null)} /></div>
                <div><Label>Notes</Label><Textarea value={editItem.notes ?? ''} onChange={e => setEditItem(p => p ? { ...p, notes: e.target.value } : null)} /></div>
                <div className="flex items-center gap-2">
                  <Switch checked={editItem.is_active} onCheckedChange={v => setEditItem(p => p ? { ...p, is_active: v } : null)} />
                  <Label>Active</Label>
                </div>
              </div>
            )}
            <DialogFooter>
              <Button variant="outline" onClick={() => setEditItem(null)}>Cancel</Button>
              <Button onClick={() => editItem && handleSave(editItem)} disabled={saving}>
                {saving && <Loader2 className="w-4 h-4 mr-1 animate-spin" />}<Save className="w-4 h-4 mr-1" />Save
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </CardContent>
    </Card>
  );
}
