import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Loader2, CreditCard, Database } from 'lucide-react';
import { format } from 'date-fns';
import { useToast } from '@/hooks/use-toast';
import { maskEmail } from '@/lib/mask-email';

interface Subscription {
  id: string;
  user_email: string;
  plan: 'monthly' | 'yearly';
  amount: number | null;
  currency: string | null;
  billing_interval: string | null;
  status: 'active' | 'trialing' | 'cancelled' | 'expired' | 'past_due';
  stripe_subscription_id: string | null;
  start_date: string;
  end_date: string | null;
}

export default function SubscriptionsTab() {
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [cancelDialogOpen, setCancelDialogOpen] = useState(false);
  const [refundDialogOpen, setRefundDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [selectedSub, setSelectedSub] = useState<Subscription | null>(null);
  const [editPlan, setEditPlan] = useState<string>('monthly');
  const [editStatus, setEditStatus] = useState<string>('active');
  const [editAmount, setEditAmount] = useState<string>('');
  const { toast } = useToast();

  useEffect(() => {
    fetchSubscriptions();
  }, []);

  const fetchSubscriptions = async () => {
    setLoading(true);
    try {
      const { data: sessionData } = await supabase.auth.getSession();
      
      const response = await supabase.functions.invoke('external-db-query', {
        body: { table: 'subscriptions', limit: 200, offset: 0 },
        headers: sessionData.session ? {
          Authorization: `Bearer ${sessionData.session.access_token}`,
        } : {},
      });

      if (response.error) {
        throw new Error(response.error.message);
      }

      setSubscriptions(response.data.data || []);
    } catch (error: any) {
      console.error('Error fetching subscriptions:', error);
      toast({
        title: 'Error',
        description: 'Failed to fetch subscriptions from database',
        variant: 'destructive',
      });
    }
    setLoading(false);
  };

  const handleEditClick = (sub: Subscription) => {
    setSelectedSub(sub);
    setEditPlan(sub.plan);
    setEditStatus(sub.status);
    setEditAmount(sub.amount?.toString() || '');
    setEditDialogOpen(true);
  };

  const handleEditSave = async () => {
    if (!selectedSub) return;
    setActionLoading(selectedSub.id);
    try {
      const response = await supabase.functions.invoke('external-db-mutate', {
        body: {
          table: 'subscriptions', operation: 'update', id: selectedSub.id,
          data: {
            plan: editPlan,
            status: editStatus,
            amount: editAmount ? parseFloat(editAmount) : null,
          }
        }
      });
      if (response.error) throw new Error(response.error.message);
      toast({ title: 'Subscription updated' });
      setEditDialogOpen(false);
      fetchSubscriptions();
    } catch (e: any) {
      toast({ title: 'Update failed', description: e.message, variant: 'destructive' });
    }
    setActionLoading(null);
  };

  const handleCancelClick = (sub: Subscription) => {
    setSelectedSub(sub);
    setCancelDialogOpen(true);
  };

  const handleRefundClick = (sub: Subscription) => {
    setSelectedSub(sub);
    setRefundDialogOpen(true);
  };

  const handleStripeCancel = async (cancelImmediately: boolean = false) => {
    if (!selectedSub) return;
    setActionLoading(selectedSub.id);

    if (!selectedSub.stripe_subscription_id) {
      const response = await supabase.functions.invoke('external-db-mutate', {
        body: {
          table: 'subscriptions', operation: 'update', id: selectedSub.id,
          data: { status: 'cancelled', end_date: new Date().toISOString() }
        }
      });
      if (response.error) {
        toast({ title: 'Cancellation failed', description: response.error.message, variant: 'destructive' });
      } else {
        toast({ title: 'Subscription cancelled', description: 'Status updated in database.' });
        setCancelDialogOpen(false);
        fetchSubscriptions();
      }
      setActionLoading(null);
      return;
    }

    try {
      const { data, error } = await supabase.functions.invoke('stripe-cancel-subscription', {
        body: { subscriptionId: selectedSub.stripe_subscription_id, cancelImmediately }
      });
      if (error) throw error;
      toast({
        title: 'Subscription cancelled',
        description: cancelImmediately
          ? 'The subscription has been cancelled immediately.'
          : 'The subscription will be cancelled at the end of the billing period.',
      });
      setCancelDialogOpen(false);
      fetchSubscriptions();
    } catch (error: any) {
      const response = await supabase.functions.invoke('external-db-mutate', {
        body: {
          table: 'subscriptions', operation: 'update', id: selectedSub.id,
          data: { status: 'cancelled', end_date: new Date().toISOString() }
        }
      });
      if (response.error) {
        toast({ title: 'Cancellation failed', description: error.message, variant: 'destructive' });
      } else {
        toast({ title: 'Subscription cancelled', description: 'Status updated in database.' });
        setCancelDialogOpen(false);
        fetchSubscriptions();
      }
    }
    setActionLoading(null);
  };

  const handleStripeRefund = async () => {
    if (!selectedSub) return;
    setActionLoading(selectedSub.id);

    if (!selectedSub.stripe_subscription_id) {
      const response = await supabase.functions.invoke('external-db-mutate', {
        body: {
          table: 'subscriptions', operation: 'update', id: selectedSub.id,
          data: { status: 'cancelled', end_date: new Date().toISOString() }
        }
      });
      if (response.error) {
        toast({ title: 'Refund failed', description: response.error.message, variant: 'destructive' });
      } else {
        toast({ title: 'Subscription cancelled', description: 'No Stripe subscription. Status updated locally.' });
        setRefundDialogOpen(false);
        fetchSubscriptions();
      }
      setActionLoading(null);
      return;
    }

    try {
      const { data, error } = await supabase.functions.invoke('stripe-refund-subscription', {
        body: { subscriptionId: selectedSub.stripe_subscription_id }
      });
      if (error) throw error;
      toast({ title: 'Refund processed', description: 'The subscription has been refunded and cancelled.' });
      setRefundDialogOpen(false);
      fetchSubscriptions();
    } catch (error: any) {
      toast({ title: 'Refund failed', description: error.message, variant: 'destructive' });
    }
    setActionLoading(null);
  };

  const getStatusBadge = (status: Subscription['status']) => {
    const styles: Record<Subscription['status'], string> = {
      active: 'bg-accent text-accent-foreground',
      trialing: 'bg-cosmic-gold/20 text-cosmic-gold border border-cosmic-gold/30',
      cancelled: 'bg-secondary/20 text-secondary',
      expired: 'bg-muted text-muted-foreground',
      past_due: 'bg-destructive/20 text-destructive',
    };
    return <Badge className={styles[status]}>{status}</Badge>;
  };

  const getPlanBadge = (plan: Subscription['plan']) => {
    const styles: Record<string, string> = {
      monthly: 'bg-muted text-muted-foreground',
      yearly: 'bg-cosmic-gold/20 text-cosmic-gold border border-cosmic-gold/30',
    };
    const names: Record<string, string> = {
      monthly: 'Monthly',
      yearly: 'Annual',
    };
    return <Badge className={styles[plan] || ''}>{names[plan] || plan}</Badge>;
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
            <CreditCard className="w-6 h-6 text-primary" />
            Subscription Management
            <Badge variant="outline" className="ml-2 border-purple-500 text-purple-500">
              <Database className="w-3 h-3 mr-1" />
              Database
            </Badge>
          </CardTitle>
          <CardDescription>View and manage all active subscriptions from database</CardDescription>
        </CardHeader>
        <CardContent>
          {subscriptions.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              No subscriptions found.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="border-border/50">
                    <TableHead className="text-muted-foreground">Customer</TableHead>
                    <TableHead className="text-muted-foreground">Plan</TableHead>
                    <TableHead className="text-muted-foreground">Amount</TableHead>
                    <TableHead className="text-muted-foreground">Status</TableHead>
                    <TableHead className="text-muted-foreground">Billing Period</TableHead>
                    <TableHead className="text-muted-foreground">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {subscriptions.map((sub) => (
                    <TableRow key={sub.id} className="border-border/50 hover:bg-muted/30">
                      <TableCell>{maskEmail(sub.user_email)}</TableCell>
                      <TableCell>{getPlanBadge(sub.plan)}</TableCell>
                      <TableCell className="font-medium">
                        ${Number(sub.amount || 0).toFixed(2)}/{sub.billing_interval === 'year' ? 'yr' : 'mo'}
                      </TableCell>
                      <TableCell>{getStatusBadge(sub.status)}</TableCell>
                      <TableCell>
                        {sub.start_date ? format(new Date(sub.start_date), 'dd/MM/yyyy') : '-'} - {' '}
                        {sub.end_date ? format(new Date(sub.end_date), 'dd/MM/yyyy') : 'Ongoing'}
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          <Button
                            variant="ghost" size="sm"
                            className="text-primary hover:text-primary/80"
                            onClick={() => handleEditClick(sub)}
                          >
                            Edit
                          </Button>
                          {(sub.status === 'active' || sub.status === 'trialing') && (
                            <>
                              <Button 
                                variant="ghost" 
                                size="sm" 
                                className="text-destructive hover:text-destructive/80"
                                onClick={() => handleRefundClick(sub)}
                                disabled={actionLoading === sub.id}
                              >
                                Refund
                              </Button>
                              <Button 
                                variant="ghost" 
                                size="sm" 
                                className="text-muted-foreground hover:text-foreground"
                                onClick={() => handleCancelClick(sub)}
                                disabled={actionLoading === sub.id}
                              >
                                {actionLoading === sub.id && <Loader2 className="w-4 h-4 mr-1 animate-spin" />}
                                Cancel
                              </Button>
                            </>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Edit Dialog */}
      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent className="glass border-border">
          <DialogHeader>
            <DialogTitle>Edit Subscription</DialogTitle>
            <DialogDescription>Update subscription details.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            {selectedSub?.stripe_subscription_id && (
              <div className="bg-destructive/10 border border-destructive/30 rounded-md p-3 text-xs text-destructive">
                ? Changes here only affect the local database. Stripe is NOT updated.
                Plan and amount are locked because they are managed by Stripe.
              </div>
            )}
            {!selectedSub?.stripe_subscription_id && (
              <div className="bg-accent/10 border border-accent/30 rounded-md p-3 text-xs text-accent">
                ? No Stripe subscription linked. Changes apply to the local database only.
              </div>
            )}
            <div>
              <Label>Customer</Label>
              <p className="text-sm text-muted-foreground">{maskEmail(selectedSub?.user_email || '')}</p>
            </div>
            <div className="space-y-2">
              <Label>Plan</Label>
              <Select value={editPlan} onValueChange={setEditPlan} disabled={!!selectedSub?.stripe_subscription_id}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="monthly">Monthly</SelectItem>
                  <SelectItem value="yearly">Annual</SelectItem>
                </SelectContent>
              </Select>
              {selectedSub?.stripe_subscription_id && (
                <p className="text-xs text-muted-foreground">Locked � managed by Stripe</p>
              )}
            </div>
            <div className="space-y-2">
              <Label>Status</Label>
              <Select value={editStatus} onValueChange={setEditStatus}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="trialing">Trialing</SelectItem>
                  <SelectItem value="cancelled">Cancelled</SelectItem>
                  <SelectItem value="expired">Expired</SelectItem>
                  <SelectItem value="past_due">Past Due</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Amount ($)</Label>
              <Input type="number" value={editAmount} onChange={e => setEditAmount(e.target.value)} placeholder="0.00" disabled={!!selectedSub?.stripe_subscription_id} />
              {selectedSub?.stripe_subscription_id && (
                <p className="text-xs text-muted-foreground">Locked � managed by Stripe</p>
              )}
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleEditSave} disabled={actionLoading === selectedSub?.id}>
              {actionLoading === selectedSub?.id && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              Save
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Cancel Dialog */}
      <Dialog open={cancelDialogOpen} onOpenChange={setCancelDialogOpen}>
        <DialogContent className="glass border-border">
          <DialogHeader>
            <DialogTitle>Cancel Subscription</DialogTitle>
            <DialogDescription>
              Choose how you want to cancel this subscription.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <p className="text-sm text-muted-foreground">
              Customer: <span className="text-foreground">{maskEmail(selectedSub?.user_email)}</span>
            </p>
            <p className="text-sm text-muted-foreground">
              Plan: <span className="text-foreground">{selectedSub?.plan === 'yearly' ? 'Annual' : 'Monthly'}</span>
            </p>
          </div>
          <DialogFooter className="flex-col sm:flex-row gap-2">
            <Button variant="outline" onClick={() => setCancelDialogOpen(false)}>
              Keep Active
            </Button>
            <Button 
              variant="secondary" 
              onClick={() => handleStripeCancel(false)}
              disabled={actionLoading === selectedSub?.id}
            >
              Cancel at Period End
            </Button>
            <Button 
              variant="destructive" 
              onClick={() => handleStripeCancel(true)}
              disabled={actionLoading === selectedSub?.id}
            >
              {actionLoading === selectedSub?.id && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              Cancel Immediately
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Refund Dialog */}
      <Dialog open={refundDialogOpen} onOpenChange={setRefundDialogOpen}>
        <DialogContent className="glass border-border">
          <DialogHeader>
            <DialogTitle>Refund Subscription</DialogTitle>
            <DialogDescription>
              This will refund the latest payment and cancel the subscription.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <p className="text-sm text-muted-foreground">
              Customer: <span className="text-foreground">{maskEmail(selectedSub?.user_email)}</span>
            </p>
            <p className="text-sm text-muted-foreground">
              Plan: <span className="text-foreground">{selectedSub?.plan === 'yearly' ? 'Annual' : 'Monthly'}</span>
            </p>
            <p className="text-sm text-muted-foreground">
              Amount: <span className="text-foreground font-medium">${Number(selectedSub?.amount || 0).toFixed(2)}</span>
            </p>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setRefundDialogOpen(false)}>
              Cancel
            </Button>
            <Button 
              variant="destructive" 
              onClick={handleStripeRefund}
              disabled={actionLoading === selectedSub?.id}
            >
              {actionLoading === selectedSub?.id && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              Process Refund
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
