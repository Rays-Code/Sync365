import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Loader2, Globe, Plus, Edit, Trash2, Check, X } from 'lucide-react';
import { toast } from 'sonner';
import type { CountryPricingEntry } from '@/hooks/useCountryPricing';

const COMMON_COUNTRIES = [
  { code: 'IN', name: 'India' },
  { code: 'PK', name: 'Pakistan' },
  { code: 'BD', name: 'Bangladesh' },
  { code: 'LK', name: 'Sri Lanka' },
  { code: 'NP', name: 'Nepal' },
  { code: 'DE', name: 'Germany' },
  { code: 'GB', name: 'United Kingdom' },
  { code: 'US', name: 'United States' },
  { code: 'AU', name: 'Australia' },
  { code: 'CA', name: 'Canada' },
  { code: 'NZ', name: 'New Zealand' },
  { code: 'PH', name: 'Philippines' },
  { code: 'NG', name: 'Nigeria' },
  { code: 'KE', name: 'Kenya' },
  { code: 'ZA', name: 'South Africa' },
  { code: 'BR', name: 'Brazil' },
  { code: 'MX', name: 'Mexico' },
  { code: 'EG', name: 'Egypt' },
];

function formatPrice(price: number, currency: string): string {
  if (price === 0) return 'Free';
  const symbols: Record<string, string> = { USD: '$', AUD: '$', GBP: '�', EUR: '�', INR: '?', PKR: 'Rs', BDT: '?' };
  const symbol = symbols[currency.toUpperCase()] || `${currency} `;
  return `${symbol}${price.toFixed(2)}`;
}

export default function CountryPricingManager() {
  const [entries, setEntries] = useState<CountryPricingEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingEntry, setEditingEntry] = useState<CountryPricingEntry | null>(null);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState<string | null>(null);

  // Form state
  const [formCountryCode, setFormCountryCode] = useState('');
  const [formCountryName, setFormCountryName] = useState('');
  const [formMonthlyPrice, setFormMonthlyPrice] = useState('0');
  const [formYearlyPrice, setFormYearlyPrice] = useState('0');
  const [formCurrency, setFormCurrency] = useState('AUD');
  const [formIsFree, setFormIsFree] = useState(false);

  useEffect(() => { fetchEntries(); }, []);

  const fetchEntries = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('country_pricing')
        .select('*')
        .order('country_code');
      if (error) throw error;
      setEntries((data || []) as unknown as CountryPricingEntry[]);
    } catch (err: any) {
      toast.error('Failed to fetch country pricing');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const openAddDialog = () => {
    setEditingEntry(null);
    setFormCountryCode('');
    setFormCountryName('');
    setFormMonthlyPrice('0');
    setFormYearlyPrice('0');
    setFormCurrency('AUD');
    setFormIsFree(false);
    setDialogOpen(true);
  };

  const openEditDialog = (entry: CountryPricingEntry) => {
    setEditingEntry(entry);
    setFormCountryCode(entry.country_code);
    setFormCountryName(entry.country_name);
    setFormMonthlyPrice(entry.monthly_price.toString());
    setFormYearlyPrice(entry.yearly_price.toString());
    setFormCurrency(entry.currency);
    setFormIsFree(entry.is_free);
    setDialogOpen(true);
  };

  const handleCountrySelect = (code: string) => {
    setFormCountryCode(code);
    const found = COMMON_COUNTRIES.find((c) => c.code === code);
    if (found) setFormCountryName(found.name);
  };

  const handleSave = async () => {
    if (!formCountryCode.trim()) {
      toast.error('Country code is required');
      return;
    }
    setSaving(true);
    try {
      const payload = {
        action: 'save_country_pricing',
        country_id: editingEntry?.id || null,
        country_code: formCountryCode.toUpperCase().trim(),
        country_name: formCountryName.trim(),
        monthly_price: parseFloat(formMonthlyPrice) || 0,
        yearly_price: parseFloat(formYearlyPrice) || 0,
        currency: formCurrency.toUpperCase().trim(),
        is_free: formIsFree,
      };

      const { data, error } = await supabase.functions.invoke('update-pricing', {
        body: payload,
      });

      if (error) throw error;
      if (data?.error) throw new Error(data.error);

      const verb = editingEntry ? 'Updated' : 'Added';
      const stripeNote = formIsFree ? '' : ' (Stripe prices synced ?)';
      toast.success(`${verb} pricing for ${payload.country_code}${stripeNote}`);
      setDialogOpen(false);
      fetchEntries();
    } catch (err: any) {
      toast.error(err.message || 'Failed to save');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (entry: CountryPricingEntry) => {
    if (!confirm(`Remove pricing for ${entry.country_code} (${entry.country_name})? This will also archive associated Stripe prices.`)) return;
    setDeleting(entry.id);
    try {
      const { data, error } = await supabase.functions.invoke('update-pricing', {
        body: { action: 'delete_country_pricing', country_id: entry.id },
      });

      if (error) throw error;
      if (data?.error) throw new Error(data.error);

      toast.success(`Removed pricing for ${entry.country_code}`);
      fetchEntries();
    } catch (err: any) {
      toast.error(err.message || 'Failed to delete');
    } finally {
      setDeleting(null);
    }
  };

  if (loading) {
    return (
      <Card className="glass border-border/50">
        <CardContent className="py-12 flex justify-center">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="glass border-border/50">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="font-heading text-xl flex items-center gap-2">
              <Globe className="w-5 h-5 text-primary" />
              Country-Specific Pricing
            </CardTitle>
            <CardDescription>
              Set custom monthly & yearly prices per country. Countries not listed use the default global pricing.
            </CardDescription>
          </div>
          <Button onClick={openAddDialog} className="btn-cosmic" size="sm">
            <Plus className="w-4 h-4 mr-1" /> Add Country
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {entries.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground">
            <Globe className="w-12 h-12 mx-auto mb-4 opacity-30" />
            <p className="text-lg font-medium">No country pricing configured</p>
            <p className="text-sm">All users see the default global pricing. Click "Add Country" to set regional prices.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="border-border/50">
                  <TableHead className="text-muted-foreground">Country</TableHead>
                  <TableHead className="text-muted-foreground">Monthly</TableHead>
                  <TableHead className="text-muted-foreground">Yearly</TableHead>
                  <TableHead className="text-muted-foreground">Currency</TableHead>
                  <TableHead className="text-muted-foreground">Stripe</TableHead>
                  <TableHead className="text-muted-foreground">Status</TableHead>
                  <TableHead className="text-muted-foreground">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {entries.map((entry) => (
                  <TableRow key={entry.id} className="border-border/50 hover:bg-muted/30">
                    <TableCell>
                      <div>
                        <span className="font-medium text-foreground">{entry.country_code}</span>
                        {entry.country_name && (
                          <span className="text-muted-foreground text-sm ml-2">{entry.country_name}</span>
                        )}
                      </div>
                    </TableCell>
                    <TableCell className="text-foreground font-semibold">
                      {entry.is_free ? 'Free' : formatPrice(entry.monthly_price, entry.currency)}
                    </TableCell>
                    <TableCell className="text-foreground font-semibold">
                      {entry.is_free ? 'Free' : formatPrice(entry.yearly_price, entry.currency)}
                    </TableCell>
                    <TableCell className="text-muted-foreground">{entry.currency}</TableCell>
                    <TableCell>
                      {entry.is_free ? (
                        <span className="text-xs text-muted-foreground">N/A</span>
                      ) : entry.monthly_stripe_price_id && entry.yearly_stripe_price_id ? (
                        <Badge className="bg-green-500/10 text-green-500 border-green-500/30">
                          <Check className="w-3 h-3 mr-1" /> Synced
                        </Badge>
                      ) : (
                        <Badge variant="destructive" className="text-xs">
                          <X className="w-3 h-3 mr-1" /> Not synced
                        </Badge>
                      )}
                    </TableCell>
                    <TableCell>
                      {entry.is_free ? (
                        <Badge className="bg-green-500/10 text-green-500 border-green-500/30">
                          <Check className="w-3 h-3 mr-1" /> Free
                        </Badge>
                      ) : (
                        <Badge variant="outline" className="text-foreground">
                          Paid
                        </Badge>
                      )}
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <Button variant="outline" size="sm" onClick={() => openEditDialog(entry)}>
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDelete(entry)}
                          disabled={deleting === entry.id}
                          className="text-destructive hover:text-destructive"
                        >
                          {deleting === entry.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}

        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogContent className="glass border-border/50">
            <DialogHeader>
              <DialogTitle className="font-heading">
                {editingEntry ? `Edit ${editingEntry.country_code} Pricing` : 'Add Country Pricing'}
              </DialogTitle>
              <DialogDescription>
                Set custom monthly & yearly subscription prices for this country.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              {!editingEntry && (
                <div className="space-y-2">
                  <Label>Country</Label>
                  <div className="flex flex-wrap gap-2 mb-2">
                    {COMMON_COUNTRIES.filter(
                      (c) => !entries.some((e) => e.country_code === c.code)
                    )
                      .slice(0, 12)
                      .map((c) => (
                        <Button
                          key={c.code}
                          variant={formCountryCode === c.code ? 'default' : 'outline'}
                          size="sm"
                          onClick={() => handleCountrySelect(c.code)}
                          className="text-xs"
                        >
                          {c.code} - {c.name}
                        </Button>
                      ))}
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <Label className="text-xs">ISO Code</Label>
                      <Input
                        value={formCountryCode}
                        onChange={(e) => setFormCountryCode(e.target.value.toUpperCase())}
                        placeholder="IN"
                        maxLength={2}
                      />
                    </div>
                    <div>
                      <Label className="text-xs">Name</Label>
                      <Input
                        value={formCountryName}
                        onChange={(e) => setFormCountryName(e.target.value)}
                        placeholder="India"
                      />
                    </div>
                  </div>
                </div>
              )}

              <div className="flex items-center justify-between p-3 rounded-lg bg-muted/30">
                <div>
                  <Label>Completely Free</Label>
                  <p className="text-xs text-muted-foreground">All features free, no payment required</p>
                </div>
                <Switch checked={formIsFree} onCheckedChange={setFormIsFree} />
              </div>

              {!formIsFree && (
                <>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Monthly Price</Label>
                      <Input
                        type="number"
                        step="0.01"
                        min="0"
                        value={formMonthlyPrice}
                        onChange={(e) => setFormMonthlyPrice(e.target.value)}
                        placeholder="5.00"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Yearly Price</Label>
                      <Input
                        type="number"
                        step="0.01"
                        min="0"
                        value={formYearlyPrice}
                        onChange={(e) => setFormYearlyPrice(e.target.value)}
                        placeholder="55.00"
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label>Currency</Label>
                    <Input
                      value={formCurrency}
                      onChange={(e) => setFormCurrency(e.target.value.toUpperCase())}
                      placeholder="AUD"
                      maxLength={3}
                    />
                  </div>
                </>
              )}
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setDialogOpen(false)} disabled={saving}>
                Cancel
              </Button>
              <Button onClick={handleSave} disabled={saving} className="btn-cosmic">
                {saving ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                {editingEntry ? 'Update' : 'Add'} Country Pricing
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </CardContent>
    </Card>
  );
}
