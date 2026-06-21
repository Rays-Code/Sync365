import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Loader2, RotateCcw, Check, X, Database, Eye } from 'lucide-react';
import { format } from 'date-fns';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { maskEmail } from '@/lib/mask-email';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { RefundRequestsPanel } from './RefundRequestsPanel';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';

interface RefundRequest {
  id: string;
  user_email: string;
  stripe_subscription_id: string | null;
  amount: number | null;
  currency: string | null;
  reason: string | null;
  admin_notes: string | null;
  status: 'pending' | 'approved' | 'rejected';
  reviewed_at: string | null;
  created_at: string;
}

export default function RefundsTab() {
  const [refunds, setRefunds] = useState<RefundRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [selectedRefund, setSelectedRefund] = useState<RefundRequest | null>(null);
  const [approveDialogOpen, setApproveDialogOpen] = useState(false);
  const [rejectDialogOpen, setRejectDialogOpen] = useState(false);
  const [viewDialogOpen, setViewDialogOpen] = useState(false);
  const [adminNotes, setAdminNotes] = useState('');
  const { toast } = useToast();
  const { user } = useAuth();

  useEffect(() => {
    fetchRefunds();
  }, []);

  const fetchRefunds = async () => {
    setLoading(true);
    try {
      const { data: sessionData } = await supabase.auth.getSession();
      
      const response = await supabase.functions.invoke('external-db-query', {
        body: { table: 'refund_requests', limit: 200, offset: 0 },
        headers: sessionData.session ? {
          Authorization: `Bearer ${sessionData.session.access_token}`,
        } : {},
      });

      if (response.error) {
        throw new Error(response.error.message);
      }

      setRefunds(response.data.data || []);
    } catch (error: any) {
      console.error('Error fetching refunds:', error);
      toast({
        title: 'Error',
        description: 'Failed to fetch refunds from database',
        variant: 'destructive',
      });
    }
    setLoading(false);
  };

  const handleApproveClick = (refund: RefundRequest) => {
    setSelectedRefund(refund);
    setAdminNotes(refund.admin_notes || '');
    setApproveDialogOpen(true);
  };

  const handleRejectClick = (refund: RefundRequest) => {
    setSelectedRefund(refund);
    setAdminNotes('');
    setRejectDialogOpen(true);
  };

  const handleViewClick = (refund: RefundRequest) => {
    setSelectedRefund(refund);
    setViewDialogOpen(true);
  };

  const handleApprove = async () => {
    if (!selectedRefund) return;
    
    setActionLoading(selectedRefund.id);
    try {
      const stripeSubId = selectedRefund.stripe_subscription_id;
      if (stripeSubId) {
        const refundRes = await supabase.functions.invoke('stripe-refund-subscription', {
          body: { subscriptionId: stripeSubId }
        });
        if (refundRes.error) throw new Error(refundRes.error.message);
      }

      await supabase.functions.invoke('external-db-mutate', {
        body: {
          table: 'refund_requests',
          operation: 'update',
          id: selectedRefund.id,
          data: { 
            status: 'approved', 
            reviewed_at: new Date().toISOString(),
            admin_notes: adminNotes || null,
          }
        }
      });

      toast({
        title: 'Refund approved',
        description: stripeSubId ? 'The refund has been processed via Stripe.' : 'Subscription not found. Refund marked as approved.',
      });
      setApproveDialogOpen(false);
      fetchRefunds();
    } catch (error: any) {
      await supabase.functions.invoke('external-db-mutate', {
        body: {
          table: 'refund_requests',
          operation: 'update',
          id: selectedRefund.id,
          data: { status: 'approved', reviewed_at: new Date().toISOString(), admin_notes: adminNotes || null }
        }
      });
      toast({
        title: 'Refund approved',
        description: error.message || 'Stripe refund failed. Status updated in database.',
      });
      setApproveDialogOpen(false);
      fetchRefunds();
    }
    setActionLoading(null);
  };

  const handleReject = async () => {
    if (!selectedRefund) return;
    
    setActionLoading(selectedRefund.id);
    try {
      const response = await supabase.functions.invoke('external-db-mutate', {
        body: {
          table: 'refund_requests',
          operation: 'update',
          id: selectedRefund.id,
          data: { 
            status: 'rejected', 
            reviewed_at: new Date().toISOString(),
            admin_notes: adminNotes || null,
          }
        }
      });

      if (response.error) throw new Error(response.error.message);

      toast({ title: 'Refund rejected', description: 'The refund request has been rejected.' });
      setRejectDialogOpen(false);
      fetchRefunds();
    } catch (error: any) {
      toast({ title: 'Action failed', description: error.message, variant: 'destructive' });
    }
    setActionLoading(null);
  };

  const getStatusBadge = (status: RefundRequest['status']) => {
    const styles: Record<RefundRequest['status'], string> = {
      pending: 'bg-cosmic-gold/20 text-cosmic-gold border border-cosmic-gold/30',
      approved: 'bg-accent/20 text-accent',
      rejected: 'bg-destructive/20 text-destructive',
    };
    return <Badge className={styles[status]}>{status}</Badge>;
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
    <div className="space-y-6">
      <Tabs defaultValue="app-refunds" className="w-full">
        <TabsList className="grid w-full grid-cols-2 mb-6 h-10 bg-muted/50 rounded-lg">
          <TabsTrigger value="app-refunds" className="rounded-md text-xs font-medium">
            App Refunds
          </TabsTrigger>
          <TabsTrigger value="web-refunds" className="rounded-md text-xs font-medium">
            Website Refunds
          </TabsTrigger>
        </TabsList>

        <TabsContent value="app-refunds" className="space-y-6">
          <Card className="glass border-border/50">
            <CardHeader>
              <CardTitle className="font-heading text-2xl flex items-center gap-2">
                <RotateCcw className="w-6 h-6 text-primary" />
                Refund Requests
                <Badge variant="outline" className="ml-2 border-purple-500 text-purple-500">
                  <Database className="w-3 h-3 mr-1" />
                  Database
                </Badge>
              </CardTitle>
              <CardDescription>Review and process refund requests</CardDescription>
            </CardHeader>
            <CardContent>
              {refunds.length === 0 ? (
                <div className="text-center py-12 text-muted-foreground">
                  No refund requests found.
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow className="border-border/50">
                        <TableHead className="text-muted-foreground">Stripe ID</TableHead>
                        <TableHead className="text-muted-foreground">User</TableHead>
                        <TableHead className="text-muted-foreground">Amount</TableHead>
                        <TableHead className="text-muted-foreground">Reason</TableHead>
                        <TableHead className="text-muted-foreground">Status</TableHead>
                        <TableHead className="text-muted-foreground">Requested</TableHead>
                        <TableHead className="text-muted-foreground">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {refunds.map((refund) => (
                        <TableRow key={refund.id} className="border-border/50 hover:bg-muted/30">
                          <TableCell className="font-mono text-xs">
                            {refund.stripe_subscription_id
                              ? `${refund.stripe_subscription_id.slice(0, 12)}...`
                              : '-'}
                          </TableCell>
                          <TableCell>{maskEmail(refund.user_email)}</TableCell>
                          <TableCell className="font-medium">
                            {refund.amount != null && refund.amount > 0
                              ? `${refund.currency || 'AUD'} $${Number(refund.amount).toFixed(2)}`
                              : '�'}
                          </TableCell>
                          <TableCell className="max-w-[200px] truncate">{refund.reason || '-'}</TableCell>
                          <TableCell>{getStatusBadge(refund.status)}</TableCell>
                          <TableCell>{refund.created_at ? format(new Date(refund.created_at), 'dd/MM/yyyy') : '-'}</TableCell>
                          <TableCell>
                            <div className="flex gap-1">
                              <Button variant="ghost" size="sm" className="text-muted-foreground" onClick={() => handleViewClick(refund)}>
                                <Eye className="w-4 h-4" />
                              </Button>
                              {refund.status === 'pending' ? (
                                <>
                                  <Button 
                                    variant="ghost" 
                                    size="sm" 
                                    className="text-accent hover:text-accent/80"
                                    onClick={() => handleApproveClick(refund)}
                                    disabled={actionLoading === refund.id}
                                  >
                                    {actionLoading === refund.id ? (
                                      <Loader2 className="w-4 h-4 mr-1 animate-spin" />
                                    ) : (
                                      <Check className="w-4 h-4 mr-1" />
                                    )}
                                    Approve
                                  </Button>
                                  <Button 
                                    variant="ghost" 
                                    size="sm" 
                                    className="text-destructive hover:text-destructive/80"
                                    onClick={() => handleRejectClick(refund)}
                                    disabled={actionLoading === refund.id}
                                  >
                                    <X className="w-4 h-4 mr-1" />
                                    Reject
                                  </Button>
                                </>
                              ) : (
                                <span className="text-sm text-muted-foreground">
                                  {refund.reviewed_at ? format(new Date(refund.reviewed_at), 'dd/MM/yyyy') : ''}
                                </span>
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

          {/* View Details Dialog */}
          <Dialog open={viewDialogOpen} onOpenChange={setViewDialogOpen}>
            <DialogContent className="glass border-border">
              <DialogHeader>
                <DialogTitle>Refund Request Details</DialogTitle>
              </DialogHeader>
              <div className="space-y-3 py-2">
                <div className="grid grid-cols-3 gap-2 text-sm">
                  <span className="text-muted-foreground">User</span>
                  <span className="col-span-2">{maskEmail(selectedRefund?.user_email)}</span>
                </div>
                <div className="grid grid-cols-3 gap-2 text-sm">
                  <span className="text-muted-foreground">Amount</span>
                  <span className="col-span-2 font-medium">
                    {selectedRefund?.amount != null && selectedRefund.amount > 0
                      ? `${selectedRefund.currency || 'AUD'} $${Number(selectedRefund.amount).toFixed(2)}`
                      : '�'}
                  </span>
                </div>
                <div className="grid grid-cols-3 gap-2 text-sm">
                  <span className="text-muted-foreground">Stripe Sub</span>
                  <span className="col-span-2 font-mono text-xs">{selectedRefund?.stripe_subscription_id || '-'}</span>
                </div>
                <div className="grid grid-cols-3 gap-2 text-sm">
                  <span className="text-muted-foreground">Reason</span>
                  <span className="col-span-2">{selectedRefund?.reason || 'Not provided'}</span>
                </div>
                <div className="grid grid-cols-3 gap-2 text-sm">
                  <span className="text-muted-foreground">Status</span>
                  <span className="col-span-2">{getStatusBadge(selectedRefund?.status || 'pending')}</span>
                </div>
                <div className="grid grid-cols-3 gap-2 text-sm">
                  <span className="text-muted-foreground">Admin Notes</span>
                  <span className="col-span-2">{selectedRefund?.admin_notes || 'None'}</span>
                </div>
                <div className="grid grid-cols-3 gap-2 text-sm">
                  <span className="text-muted-foreground">Requested</span>
                  <span className="col-span-2">{selectedRefund?.created_at ? format(new Date(selectedRefund.created_at), 'dd/MM/yyyy HH:mm') : '-'}</span>
                </div>
                <div className="grid grid-cols-3 gap-2 text-sm">
                  <span className="text-muted-foreground">Reviewed</span>
                  <span className="col-span-2">{selectedRefund?.reviewed_at ? format(new Date(selectedRefund.reviewed_at), 'dd/MM/yyyy HH:mm') : 'Not yet'}</span>
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setViewDialogOpen(false)}>Close</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>

          {/* Approve Dialog */}
          <Dialog open={approveDialogOpen} onOpenChange={setApproveDialogOpen}>
            <DialogContent className="glass border-border">
              <DialogHeader>
                <DialogTitle>Approve Refund</DialogTitle>
                <DialogDescription>
                  This will process the refund via Stripe and update the request status.
                </DialogDescription>
              </DialogHeader>
              <div className="py-4 space-y-4">
                <div className="space-y-2 text-sm">
                  <p className="text-muted-foreground">
                    Customer: <span className="text-foreground">{maskEmail(selectedRefund?.user_email)}</span>
                  </p>
                  <p className="text-muted-foreground">
                    Amount: <span className="text-foreground font-medium">
                      {selectedRefund?.amount != null && selectedRefund.amount > 0
                        ? `${selectedRefund.currency || 'AUD'} $${Number(selectedRefund.amount).toFixed(2)}`
                        : '�'}
                    </span>
                  </p>
                  <p className="text-muted-foreground">
                    Stripe Subscription: <span className="text-foreground font-mono text-xs">{selectedRefund?.stripe_subscription_id || 'None'}</span>
                  </p>
                  <p className="text-muted-foreground">
                    Reason: <span className="text-foreground">{selectedRefund?.reason || 'Not provided'}</span>
                  </p>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="approve-notes">Admin Notes</Label>
                  <Textarea
                    id="approve-notes"
                    placeholder="Optional notes about this approval..."
                    value={adminNotes}
                    onChange={(e) => setAdminNotes(e.target.value)}
                    className="bg-muted/30 border-border/50 min-h-[80px]"
                  />
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setApproveDialogOpen(false)}>
                  Cancel
                </Button>
                <Button 
                  onClick={handleApprove}
                  disabled={actionLoading === selectedRefund?.id}
                >
                  {actionLoading === selectedRefund?.id && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                  Approve & Process Refund
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>

          {/* Reject Dialog */}
          <Dialog open={rejectDialogOpen} onOpenChange={setRejectDialogOpen}>
            <DialogContent className="glass border-border">
              <DialogHeader>
                <DialogTitle>Reject Refund</DialogTitle>
                <DialogDescription>
                  This will mark the refund request as rejected.
                </DialogDescription>
              </DialogHeader>
              <div className="py-4 space-y-4">
                <div className="space-y-2 text-sm">
                  <p className="text-muted-foreground">
                    Customer: <span className="text-foreground">{maskEmail(selectedRefund?.user_email)}</span>
                  </p>
                  <p className="text-muted-foreground">
                    Reason: <span className="text-foreground">{selectedRefund?.reason || 'Not provided'}</span>
                  </p>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="reject-notes">Admin Notes (optional)</Label>
                  <Textarea
                    id="reject-notes"
                    placeholder="Explain why this request was rejected..."
                    value={adminNotes}
                    onChange={(e) => setAdminNotes(e.target.value)}
                    className="bg-muted/30 border-border/50 min-h-[80px]"
                  />
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setRejectDialogOpen(false)}>
                  Cancel
                </Button>
                <Button 
                  variant="destructive"
                  onClick={handleReject}
                  disabled={actionLoading === selectedRefund?.id}
                >
                  {actionLoading === selectedRefund?.id && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                  Reject Request
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </TabsContent>

        <TabsContent value="web-refunds" className="space-y-6">
          <RefundRequestsPanel />
        </TabsContent>
      </Tabs>
    </div>
  );
}
