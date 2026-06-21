import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import CountryPricingManager from './CountryPricingManager';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Loader2, DollarSign, Check, X, Trash2, Eye, Plus } from 'lucide-react';
import { toast } from 'sonner';
import type { PricingPlan } from '@/hooks/usePricingPlans';

interface StripePrice {
  id: string;
  unit_amount: number;
  currency: string;
  recurring: { interval: string } | null;
  active: boolean;
  created: number;
  metadata: Record<string, string>;
}

export default function PricingTab() {
  const [plans, setPlans] = useState<PricingPlan[]>([]);
  const [loading, setLoading] = useState(true);
  const [deletingPlanId, setDeletingPlanId] = useState<string | null>(null);

  const [pricesDialogOpen, setPricesDialogOpen] = useState(false);
  const [pricesPlan, setPricesPlan] = useState<PricingPlan | null>(null);
  const [stripePrices, setStripePrices] = useState<StripePrice[]>([]);
  const [pricesLoading, setPricesLoading] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const [addDialogOpen, setAddDialogOpen] = useState(false);
  const [addPlan, setAddPlan] = useState<PricingPlan | null>(null);
  const [addAmount, setAddAmount] = useState('');
  const [addInterval, setAddInterval] = useState<'month' | 'year'>('month');
  const [addCurrency, setAddCurrency] = useState('AUD');
  const [adding, setAdding] = useState(false);

  useEffect(() => {
    fetchPlans();
  }, []);

  const fetchPlans = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('update-pricing', {
        body: { action: 'list' },
      });
      if (error) throw error;
      setPlans(data.data || []);
    } catch (err: any) {
      toast.error('Failed to fetch pricing plans');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const openPricesDialog = async (plan: PricingPlan) => {
    setPricesPlan(plan);
    setStripePrices([]);
    setPricesDialogOpen(true);
    setPricesLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('update-pricing', {
        body: { action: 'list_stripe_prices', plan_id: plan.id },
      });
      if (error || data?.error) throw new Error(data?.error || error?.message);
      setStripePrices(data.data || []);
    } catch (err: any) {
      toast.error(err.message || 'Failed to load Stripe prices');
    } finally {
      setPricesLoading(false);
    }
  };

  const handleDeletePlanPrice = async (plan: PricingPlan) => {
    setDeletingPlanId(plan.id);
    try {
      const { data, error } = await supabase.functions.invoke('update-pricing', {
        body: { action: 'delete_plan_price', plan_id: plan.id },
      });
      if (error || data?.error) throw new Error(data?.error || error?.message);
      toast.success('Stripe price removed');
      fetchPlans();
    } catch (err: any) {
      toast.error(err.message || 'Failed to delete price');
    } finally {
      setDeletingPlanId(null);
    }
  };

  const handleDeletePrice = async (priceId: string) => {
    setDeletingId(priceId);
    try {
      const { data, error } = await supabase.functions.invoke('update-pricing', {
        body: { action: 'delete_stripe_price', stripe_price_id: priceId },
      });
      if (error || data?.error) throw new Error(data?.error || error?.message);
      toast.success('Price removed');
      setStripePrices((prev) => prev.filter((p) => p.id !== priceId));
    } catch (err: any) {
      toast.error(err.message || 'Failed to delete price');
    } finally {
      setDeletingId(null);
    }
  };

  const openAddDialog = (plan: PricingPlan) => {
    setAddPlan(plan);
    setAddAmount('');
    setAddInterval(plan.billing_interval === 'year' ? 'year' : 'month');
    setAddCurrency(plan.currency || 'AUD');
    setAddDialogOpen(true);
  };

  const handleAddPrice = async () => {
    if (!addPlan || !addAmount) return;
    setAdding(true);
    try {
      const { data, error } = await supabase.functions.invoke('update-pricing', {
        body: {
          action: 'add_price',
          plan_id: addPlan.id,
          amount: parseFloat(addAmount),
          interval: addInterval,
          currency: addCurrency,
        },
      });
      if (error || data?.error) throw new Error(data?.error || error?.message);
      toast.success('Price added to Stripe');
      setAddDialogOpen(false);
      fetchPlans();
    } catch (err: any) {
      toast.error(err.message || 'Failed to add price');
    } finally {
      setAdding(false);
    }
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
    <>
    <Card className="glass border-border/50">
      <CardHeader>
        <CardTitle className="font-heading text-2xl flex items-center gap-2">
          <DollarSign className="w-6 h-6 text-primary" />
          Pricing Management
        </CardTitle>
        <CardDescription>
          Manage plan prices. Delete old prices and add new ones to update billing.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="border-border/50">
                <TableHead className="text-muted-foreground">Plan</TableHead>
                <TableHead className="text-muted-foreground">Price</TableHead>
                <TableHead className="text-muted-foreground">Status</TableHead>
                <TableHead className="text-muted-foreground">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {plans.map((plan) => (
                <TableRow key={plan.id} className="border-border/50 hover:bg-muted/30">
                  <TableCell>
                    <div>
                      <p className="font-medium text-foreground">{plan.name}</p>
                      <p className="text-xs text-muted-foreground">{plan.plan_key}</p>
                    </div>
                  </TableCell>
                  <TableCell>
                    <span className="text-foreground font-semibold">
                      {plan.price === 0 ? 'Free' : `$${plan.price}/${plan.billing_interval}`}
                    </span>
                  </TableCell>
                  <TableCell>
                    {plan.is_active ? (
                      <Badge className="bg-green-500/10 text-green-500 border-green-500/30">
                        <Check className="w-3 h-3 mr-1" />
                        Active
                      </Badge>
                    ) : (
                      <Badge variant="outline" className="text-muted-foreground">
                        <X className="w-3 h-3 mr-1" />
                        Inactive
                      </Badge>
                    )}
                  </TableCell>
                  <TableCell className="space-x-2">
                    {plan.plan_key !== 'starter' && plan.plan_key !== 'corporate' && (
                      <>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDeletePlanPrice(plan)}
                          disabled={deletingPlanId === plan.id || !plan.stripe_price_id}
                          className="border-red-500/30 text-red-400 hover:text-red-300"
                        >
                          {deletingPlanId === plan.id ? (
                            <Loader2 className="w-3 h-3 animate-spin" />
                          ) : (
                            <Trash2 className="w-3 h-3" />
                          )}
                          Delete
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => openPricesDialog(plan)}
                          className="border-border/50"
                        >
                          <Eye className="w-4 h-4 mr-1" />
                          Prices
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => openAddDialog(plan)}
                          className="border-border/50"
                        >
                          <Plus className="w-4 h-4 mr-1" />
                          Add
                        </Button>
                      </>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>

        <Dialog open={pricesDialogOpen} onOpenChange={setPricesDialogOpen}>
          <DialogContent className="glass border-border/50 max-w-2xl">
            <DialogHeader>
              <DialogTitle className="font-heading">Stripe Prices � {pricesPlan?.name}</DialogTitle>
              <DialogDescription>
                All Stripe prices for this plan's product.
              </DialogDescription>
            </DialogHeader>
            <div className="py-4">
              {pricesLoading ? (
                <div className="flex justify-center py-8">
                  <Loader2 className="w-6 h-6 animate-spin text-primary" />
                </div>
              ) : stripePrices.length === 0 ? (
                <p className="text-center text-muted-foreground py-8">No Stripe prices found for this product.</p>
              ) : (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow className="border-border/50">
                        <TableHead className="text-muted-foreground">Amount</TableHead>
                        <TableHead className="text-muted-foreground">Interval</TableHead>
                        <TableHead className="text-muted-foreground">Status</TableHead>
                        <TableHead className="text-muted-foreground">Created</TableHead>
                        <TableHead className="text-muted-foreground">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {stripePrices.map((sp) => (
                        <TableRow key={sp.id} className="border-border/50">
                          <TableCell className="font-medium">
                            ${(sp.unit_amount / 100).toFixed(2)} {sp.currency.toUpperCase()}
                          </TableCell>
                          <TableCell className="text-muted-foreground">
                            {sp.recurring?.interval || 'one-time'}
                          </TableCell>
                          <TableCell>
                            {sp.active ? (
                              <Badge className="bg-green-500/10 text-green-500 border-green-500/30 text-xs">
                                Active
                              </Badge>
                            ) : (
                              <Badge variant="outline" className="text-muted-foreground text-xs">
                                Archived
                              </Badge>
                            )}
                          </TableCell>
                          <TableCell className="text-muted-foreground text-sm">
                            {new Date(sp.created * 1000).toLocaleDateString()}
                          </TableCell>
                          <TableCell>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleDeletePrice(sp.id)}
                              disabled={deletingId === sp.id}
                              className="border-red-500/30 text-red-400 hover:text-red-300"
                            >
                              {deletingId === sp.id ? (
                                <Loader2 className="w-3 h-3 animate-spin" />
                              ) : (
                                <Trash2 className="w-3 h-3" />
                              )}
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setPricesDialogOpen(false)}>
                Close
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        <Dialog open={addDialogOpen} onOpenChange={setAddDialogOpen}>
          <DialogContent className="glass border-border/50">
            <DialogHeader>
              <DialogTitle className="font-heading">Add Price � {addPlan?.name}</DialogTitle>
              <DialogDescription>
                Create a new Stripe price for this plan's product.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label>Amount</Label>
                <Input
                  type="number"
                  step="0.01"
                  min="0"
                  value={addAmount}
                  onChange={(e) => setAddAmount(e.target.value)}
                  placeholder="29.99"
                />
              </div>
              <div className="space-y-2">
                <Label>Currency</Label>
                <Input
                  value={addCurrency}
                  onChange={(e) => setAddCurrency(e.target.value.toUpperCase())}
                  placeholder="AUD"
                  maxLength={3}
                />
              </div>
              <div className="space-y-2">
                <Label>Interval</Label>
                <Select value={addInterval} onValueChange={(v) => setAddInterval(v as 'month' | 'year')}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="month">Monthly</SelectItem>
                    <SelectItem value="year">Yearly</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setAddDialogOpen(false)} disabled={adding}>
                Cancel
              </Button>
              <Button onClick={handleAddPrice} disabled={adding || !addAmount} className="btn-cosmic">
                {adding ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                Create Price
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </CardContent>
    </Card>

    <div className="mt-6">
      <CountryPricingManager />
    </div>
    </>
  );
}
