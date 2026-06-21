import { useCallback, useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Loader2, RefreshCw, RotateCcw, Check, X } from 'lucide-react';
import { toast } from 'sonner';
import {
  adminApproveRefundRequest,
  adminListRefundRequests,
  adminRejectRefundRequest,
  type RefundRequestRow,
} from '@/services/supabaseFunctions';

type StatusFilter = 'pending' | 'all';

function statusBadge(status: RefundRequestRow['status']) {
  const styles: Record<string, string> = {
    pending: 'bg-amber-500/20 text-amber-600',
    processed: 'bg-green-500/20 text-green-600',
    rejected: 'bg-destructive/20 text-destructive',
  };
  return (
    <span className={`text-xs px-2 py-0.5 rounded-full capitalize ${styles[status] ?? 'bg-muted'}`}>
      {status}
    </span>
  );
}

export function RefundRequestsPanel() {
  const [filter, setFilter] = useState<StatusFilter>('pending');
  const [requests, setRequests] = useState<RefundRequestRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [actingId, setActingId] = useState<string | null>(null);

  const [rejectOpen, setRejectOpen] = useState(false);
  const [approveOpen, setApproveOpen] = useState(false);
  const [selected, setSelected] = useState<RefundRequestRow | null>(null);
  const [adminNotes, setAdminNotes] = useState('');
  const [subscriptionId, setSubscriptionId] = useState('');
  const [refundAmount, setRefundAmount] = useState('');

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await adminListRefundRequests(filter === 'pending' ? 'pending' : undefined);
      setRequests(res?.requests ?? []);
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Failed to load refund requests');
      setRequests([]);
    } finally {
      setLoading(false);
    }
  }, [filter]);

  useEffect(() => {
    load();
  }, [load]);

  const openReject = (row: RefundRequestRow) => {
    setSelected(row);
    setAdminNotes('');
    setRejectOpen(true);
  };

  const openApprove = (row: RefundRequestRow) => {
    setSelected(row);
    setAdminNotes('');
    setSubscriptionId(row.stripe_subscription_id ?? '');
    setRefundAmount('');
    setApproveOpen(true);
  };

  const handleReject = async () => {
    if (!selected) return;
    setActingId(selected.id);
    try {
      await adminRejectRefundRequest(selected.id, adminNotes || undefined);
      toast.success('Refund request rejected');
      setRejectOpen(false);
      load();
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Reject failed');
    } finally {
      setActingId(null);
    }
  };

  const handleApprove = async () => {
    if (!selected) return;
    setActingId(selected.id);
    try {
      await adminApproveRefundRequest(selected.id, {
        subscriptionId: subscriptionId.trim() || undefined,
        refundAmount: refundAmount ? parseFloat(refundAmount) : undefined,
        adminNotes: adminNotes || undefined,
      });
      toast.success('Refund processed in Stripe');
      setApproveOpen(false);
      load();
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Approve failed');
    } finally {
      setActingId(null);
    }
  };

  const pendingCount = requests.filter((r) => r.status === 'pending').length;

  return (
    <>
      <Card className="glass border-primary/20">
        <CardHeader className="flex flex-row items-start justify-between gap-4">
          <div>
            <CardTitle className="flex items-center gap-2">
              <RotateCcw className="w-5 h-5 text-primary" />
              Refund requests
              {filter === 'pending' && pendingCount > 0 && (
                <span className="text-sm font-normal bg-primary/20 text-primary px-2 py-0.5 rounded-full">
                  {pendingCount} pending
                </span>
              )}
            </CardTitle>
            <CardDescription>
              User submissions from Dashboard ? Refund. Approve to refund via Stripe and cancel the subscription.
            </CardDescription>
          </div>
          <Button variant="outline" size="sm" onClick={load} disabled={loading}>
            <RefreshCw className={`w-4 h-4 mr-1 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-2">
            <Button
              size="sm"
              variant={filter === 'pending' ? 'default' : 'outline'}
              onClick={() => setFilter('pending')}
            >
              Pending
            </Button>
            <Button
              size="sm"
              variant={filter === 'all' ? 'default' : 'outline'}
              onClick={() => setFilter('all')}
            >
              All
            </Button>
          </div>

          {loading ? (
            <div className="flex justify-center py-10">
              <Loader2 className="w-6 h-6 animate-spin text-primary" />
            </div>
          ) : requests.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-8">
              {filter === 'pending' ? 'No pending refund requests.' : 'No refund requests yet.'}
            </p>
          ) : (
            <div className="space-y-3">
              {requests.map((row) => (
                <div
                  key={row.id}
                  className="rounded-lg border border-border/50 bg-muted/20 p-4 space-y-2"
                >
                  <div className="flex flex-wrap items-start justify-between gap-2">
                    <div>
                      <p className="font-medium text-sm">{row.user_email}</p>
                      <p className="text-xs text-muted-foreground">
                        {new Date(row.created_at).toLocaleString()}
                      </p>
                    </div>
                    {statusBadge(row.status)}
                  </div>
                  <p className="text-sm text-foreground/90 whitespace-pre-wrap">{row.reason}</p>
                  {row.stripe_subscription_id && (
                    <p className="text-xs font-mono text-muted-foreground">
                      sub: {row.stripe_subscription_id}
                    </p>
                  )}
                  {row.admin_notes && (
                    <p className="text-xs text-muted-foreground border-t border-border/40 pt-2">
                      Admin: {row.admin_notes}
                    </p>
                  )}
                  {row.status === 'pending' && (
                    <div className="flex gap-2 pt-2">
                      <Button
                        size="sm"
                        onClick={() => openApprove(row)}
                        disabled={actingId === row.id}
                      >
                        <Check className="w-4 h-4 mr-1" />
                        Approve & refund
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => openReject(row)}
                        disabled={actingId === row.id}
                      >
                        <X className="w-4 h-4 mr-1" />
                        Reject
                      </Button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <Dialog open={rejectOpen} onOpenChange={setRejectOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Reject refund request</DialogTitle>
            <DialogDescription>
              {selected?.user_email} � optional note shown internally.
            </DialogDescription>
          </DialogHeader>
          <Textarea
            placeholder="Reason for rejection (optional)"
            value={adminNotes}
            onChange={(e) => setAdminNotes(e.target.value)}
          />
          <DialogFooter>
            <Button variant="outline" onClick={() => setRejectOpen(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleReject} disabled={!!actingId}>
              Reject
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={approveOpen} onOpenChange={setApproveOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Approve & process refund</DialogTitle>
            <DialogDescription>
              Refunds the latest payment in Stripe and cancels the subscription per plan rules.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="approve-sub">Stripe subscription ID</Label>
              <Input
                id="approve-sub"
                className="mt-1 font-mono text-sm"
                placeholder="sub_..."
                value={subscriptionId}
                onChange={(e) => setSubscriptionId(e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="approve-amount">Partial refund amount (optional)</Label>
              <Input
                id="approve-amount"
                type="number"
                step="0.01"
                className="mt-1"
                placeholder="Leave empty for full refund"
                value={refundAmount}
                onChange={(e) => setRefundAmount(e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="approve-notes">Admin notes (optional)</Label>
              <Textarea
                id="approve-notes"
                className="mt-1"
                value={adminNotes}
                onChange={(e) => setAdminNotes(e.target.value)}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setApproveOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleApprove} disabled={!!actingId || !subscriptionId.trim()}>
              {actingId ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
              Process refund
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
