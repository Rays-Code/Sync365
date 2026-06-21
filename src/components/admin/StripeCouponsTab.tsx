import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Loader2, Percent, Plus, Search } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { toast } from 'sonner';

interface Coupon {
  id: string;
  name: string;
  percent_off: number | null;
  amount_off: number | null;
  currency: string | null;
  duration: 'once' | 'forever' | 'repeating';
  duration_in_months: number | null;
  max_redemptions: number | null;
  times_redeemed: number;
  valid: boolean;
  redeem_by: number | null;
  created: number;
  livemode: boolean;
}

export default function StripeCouponsTab() {
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [createOpen, setCreateOpen] = useState(false);
  const [saving, setSaving] = useState(false);


  const [formCode, setFormCode] = useState('');
  const [formName, setFormName] = useState('');
  const [formType, setFormType] = useState<'percent' | 'amount'>('percent');
  const [formValue, setFormValue] = useState('');
  const [formCurrency, setFormCurrency] = useState('AUD');
  const [formDuration, setFormDuration] = useState<'once' | 'forever' | 'repeating'>('once');
  const [formDurationMonths, setFormDurationMonths] = useState('3');
  const [formMaxRedemptions, setFormMaxRedemptions] = useState('');
  const [formRedeemByEnabled, setFormRedeemByEnabled] = useState(false);
  const [formRedeemByDate, setFormRedeemByDate] = useState('');

  useEffect(() => { fetchCoupons(); }, []);

  const fetchCoupons = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('stripe-list-coupons');
      if (error) throw error;
      setCoupons(data?.coupons || []);
    } catch (err: any) {
      toast.error('Failed to load coupons: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const filtered = coupons.filter(c => {
    if (!search) return true;
    const q = search.toLowerCase();
    return c.id.toLowerCase().includes(q) || (c.name || '').toLowerCase().includes(q);
  });

  const openCreate = () => {
    setFormCode('');
    setFormName('');
    setFormType('percent');
    setFormValue('');
    setFormCurrency('AUD');
    setFormDuration('once');
    setFormDurationMonths('3');
    setFormMaxRedemptions('');
    setFormRedeemByEnabled(false);
    setFormRedeemByDate('');
    setCreateOpen(true);
  };

  const handleCreate = async () => {
    if (!formValue || parseFloat(formValue) <= 0) {
      toast.error('Discount value must be greater than 0');
      return;
    }
    setSaving(true);
    try {
      const details: Record<string, unknown> = {
        code: formCode.toUpperCase().trim() || undefined,
        name: formName.trim() || undefined,
        duration: formDuration,
      };

      if (formType === 'percent') {
        details.percent_off = parseFloat(formValue);
      } else {
        details.amount_off = parseFloat(formValue);
        details.currency = formCurrency.toLowerCase();
      }

      if (formDuration === 'repeating') {
        details.duration_in_months = parseInt(formDurationMonths) || 3;
      }

      if (formMaxRedemptions) {
        details.max_redemptions = parseInt(formMaxRedemptions);
      }

      if (formRedeemByEnabled && formRedeemByDate) {
        details.redeem_by = Math.floor(new Date(formRedeemByDate).getTime() / 1000);
      }

      const { data, error } = await supabase.functions.invoke('stripe-create-coupon', {
        body: { couponDetails: details },
      });

      if (error) throw error;
      if (data?.error) throw new Error(data.error);

      toast.success(`Coupon ${data.coupon?.id || formCode || 'created'} created`);
      setCreateOpen(false);
      fetchCoupons();
    } catch (err: any) {
      toast.error(err.message || 'Failed to create coupon');
    } finally {
      setSaving(false);
    }
  };

  const formatDiscount = (c: Coupon) => {
    if (c.percent_off) return `${c.percent_off}%`;
    if (c.amount_off) {
      const sym = c.currency === 'aud' ? 'A$' : c.currency === 'usd' ? '$' : c.currency === 'eur' ? '�' : c.currency === 'gbp' ? '�' : (c.currency || '').toUpperCase() + ' ';
      return `${sym}${(c.amount_off / 100).toFixed(2)}`;
    }
    return '�';
  };

  const formatDuration = (c: Coupon) => {
    if (c.duration === 'once') return 'Once';
    if (c.duration === 'forever') return 'Forever';
    return `Repeating (${c.duration_in_months || '?'}mo)`;
  };

  if (loading) {
    return (
      <Card className="glass border-border/50">
        <CardContent className="py-20 flex justify-center">
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
            <CardTitle className="font-heading text-2xl flex items-center gap-2">
              <Percent className="w-6 h-6 text-primary" />
              Discount Codes
            </CardTitle>
            <CardDescription>
              Manage percentage and fixed-amount discount coupons in Stripe.
            </CardDescription>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={fetchCoupons} className="border-border/50">
              <Loader2 className={`w-4 h-4 mr-1 ${loading ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
            <Button onClick={openCreate} className="btn-cosmic" size="sm">
              <Plus className="w-4 h-4 mr-1" /> Create Coupon
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="flex gap-3 mb-4">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search by code or name..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="pl-9"
            />
          </div>
        </div>

        {coupons.length === 0 ? (
          <div className="text-center py-16 text-muted-foreground">
            <Percent className="w-12 h-12 mx-auto mb-4 opacity-30" />
            <p className="text-lg font-medium">No Stripe coupons yet</p>
            <p className="text-sm">Create a percentage or fixed-amount discount coupon to offer promotions.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="border-border/50">
                  <TableHead className="text-muted-foreground">Code</TableHead>
                  <TableHead className="text-muted-foreground">Name</TableHead>
                  <TableHead className="text-muted-foreground">Discount</TableHead>
                  <TableHead className="text-muted-foreground">Duration</TableHead>
                  <TableHead className="text-muted-foreground">Used / Max</TableHead>
                  <TableHead className="text-muted-foreground">Status</TableHead>
                  <TableHead className="text-muted-foreground">Created</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.map(c => (
                  <TableRow key={c.id} className="border-border/50 hover:bg-muted/30">
                    <TableCell>
                      <span className="font-mono font-medium text-foreground">{c.id}</span>
                    </TableCell>
                    <TableCell className="text-muted-foreground">{c.name || '�'}</TableCell>
                    <TableCell>
                      <Badge variant="outline" className="text-primary border-primary/30 font-mono">
                        {formatDiscount(c)}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">{formatDuration(c)}</TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {c.times_redeemed}{c.max_redemptions ? ` / ${c.max_redemptions}` : ''}
                    </TableCell>
                    <TableCell>
                      {c.valid ? (
                        <Badge className="bg-green-500/10 text-green-500 border-green-500/30">Active</Badge>
                      ) : (
                        <Badge variant="destructive" className="text-xs">Expired</Badge>
                      )}
                    </TableCell>
                    <TableCell className="text-xs text-muted-foreground">
                      {new Date(c.created * 1000).toLocaleDateString('en-AU', { day: '2-digit', month: 'short', year: 'numeric' })}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}

        <Dialog open={createOpen} onOpenChange={setCreateOpen}>
          <DialogContent className="glass border-border/50">
            <DialogHeader>
              <DialogTitle className="font-heading">Create Coupon</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Coupon Code</Label>
                  <Input
                    value={formCode}
                    onChange={e => setFormCode(e.target.value.toUpperCase())}
                    placeholder="Auto-generated if empty"
                  />
                  <p className="text-xs text-muted-foreground">Leave blank for Stripe to generate</p>
                </div>
                <div className="space-y-2">
                  <Label>Display Name</Label>
                  <Input
                    value={formName}
                    onChange={e => setFormName(e.target.value)}
                    placeholder="Summer Sale"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label>Discount Type</Label>
                <div className="flex gap-2">
                  <Button
                    type="button"
                    variant={formType === 'percent' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setFormType('percent')}
                  >
                    Percentage Off
                  </Button>
                  <Button
                    type="button"
                    variant={formType === 'amount' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setFormType('amount')}
                  >
                    Fixed Amount Off
                  </Button>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>{formType === 'percent' ? 'Percentage Off (%)' : 'Amount Off'}</Label>
                  <Input
                    type="number"
                    step="0.01"
                    min="0"
                    value={formValue}
                    onChange={e => setFormValue(e.target.value)}
                    placeholder={formType === 'percent' ? '10' : '5.00'}
                  />
                </div>
                {formType === 'amount' && (
                  <div className="space-y-2">
                    <Label>Currency</Label>
                    <Select value={formCurrency} onValueChange={setFormCurrency}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="AUD">AUD</SelectItem>
                        <SelectItem value="USD">USD</SelectItem>
                        <SelectItem value="EUR">EUR</SelectItem>
                        <SelectItem value="GBP">GBP</SelectItem>
                        <SelectItem value="INR">INR</SelectItem>
                        <SelectItem value="NZD">NZD</SelectItem>
                        <SelectItem value="CAD">CAD</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                )}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Duration</Label>
                  <Select value={formDuration} onValueChange={(v: 'once' | 'forever' | 'repeating') => setFormDuration(v)}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="once">Once</SelectItem>
                      <SelectItem value="forever">Forever</SelectItem>
                      <SelectItem value="repeating">Repeating</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                {formDuration === 'repeating' && (
                  <div className="space-y-2">
                    <Label>Duration (months)</Label>
                    <Input
                      type="number"
                      min="1"
                      value={formDurationMonths}
                      onChange={e => setFormDurationMonths(e.target.value)}
                    />
                  </div>
                )}
                {formDuration !== 'repeating' && <div />}
              </div>

              <div className="space-y-2">
                <Label>Max Redemptions (optional)</Label>
                <Input
                  type="number"
                  min="1"
                  value={formMaxRedemptions}
                  onChange={e => setFormMaxRedemptions(e.target.value)}
                  placeholder="Unlimited if empty"
                />
              </div>

              <div className="flex items-center gap-3">
                <Switch checked={formRedeemByEnabled} onCheckedChange={setFormRedeemByEnabled} />
                <Label>Expiration Date</Label>
              </div>
              {formRedeemByEnabled && (
                <Input
                  type="date"
                  value={formRedeemByDate}
                  onChange={e => setFormRedeemByDate(e.target.value)}
                />
              )}
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setCreateOpen(false)} disabled={saving}>
                Cancel
              </Button>
              <Button onClick={handleCreate} disabled={saving} className="btn-cosmic">
                {saving ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                Create Coupon
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </CardContent>
    </Card>
  );
}
