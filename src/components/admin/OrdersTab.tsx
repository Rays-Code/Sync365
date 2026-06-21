import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Loader2, ShoppingCart, Search, Database } from 'lucide-react';
import { format } from 'date-fns';
import { useToast } from '@/hooks/use-toast';
import { maskEmail } from '@/lib/mask-email';

interface Order {
  id: string;
  user_id: string;
  user_email: string;
  type: string;
  amount: number;
  currency: string;
  status: string;
  stripe_payment_id: string | null;
  created_at: string;
}

export default function OrdersTab() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [viewDialogOpen, setViewDialogOpen] = useState(false);
  const [refundDialogOpen, setRefundDialogOpen] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [refundLoading, setRefundLoading] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const { data: sessionData } = await supabase.auth.getSession();
      
      const response = await supabase.functions.invoke('external-db-query', {
        body: { table: 'orders', limit: 200, offset: 0 },
        headers: sessionData.session ? {
          Authorization: `Bearer ${sessionData.session.access_token}`,
        } : {},
      });

      if (response.error) {
        throw new Error(response.error.message);
      }

      setOrders(response.data.data || []);
    } catch (error: any) {
      console.error('Error fetching orders:', error);
      toast({
        title: 'Error',
        description: 'Failed to fetch orders from database',
        variant: 'destructive',
      });
    }
    setLoading(false);
  };

  const handleRefundClick = (order: Order) => {
    setSelectedOrder(order);
    setRefundDialogOpen(true);
  };

  const handleStripeRefund = async () => {
    if (!selectedOrder) return;
    
    setRefundLoading(true);
    try {
      const paymentIntentId = selectedOrder.stripe_payment_id
      if (!paymentIntentId) throw new Error('No Stripe payment ID on this order')

      const { data, error } = await supabase.functions.invoke('stripe-refund', {
        body: { 
          paymentIntentId,
          reason: 'requested_by_customer'
        }
      });

      if (error) throw error;

      toast({
        title: 'Refund processed',
        description: `Order ${selectedOrder.id.slice(0, 8)} has been refunded via Stripe.`,
      });
      setRefundDialogOpen(false);
      fetchOrders();
    } catch (error: any) {
      const response = await supabase.functions.invoke('external-db-mutate', {
        body: { 
          table: 'orders', 
          operation: 'update', 
          id: selectedOrder.id, 
          data: { status: 'refunded' } 
        }
      });
      
      if (response.error) {
        toast({
          title: 'Refund failed',
          description: error.message,
          variant: 'destructive',
        });
      } else {
        toast({
          title: 'Order marked as refunded',
          description: 'No Stripe payment found. Order status updated.',
        });
        setRefundDialogOpen(false);
        fetchOrders();
      }
    }
    setRefundLoading(false);
  };

  const filteredOrders = orders.filter((order) => {
    const matchesSearch = 
      order.id?.toLowerCase().includes(search.toLowerCase()) ||
      order.user_email?.toLowerCase().includes(search.toLowerCase()) ||
      order.type?.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = statusFilter === 'all' || order.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const getStatusBadge = (status: string) => {
    const variants: Record<string, { variant: 'default' | 'secondary' | 'destructive' | 'outline'; className: string }> = {
      pending: { variant: 'outline', className: 'border-cosmic-gold text-cosmic-gold' },
      completed: { variant: 'default', className: 'bg-accent text-accent-foreground' },
      refunded: { variant: 'secondary', className: 'bg-secondary/20 text-secondary' },
      cancelled: { variant: 'destructive', className: '' },
    };
    return <Badge className={variants[status]?.className ?? ''}>{status}</Badge>;
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
            <ShoppingCart className="w-6 h-6 text-primary" />
            Order Management
            <Badge variant="outline" className="ml-2 border-purple-500 text-purple-500">
              <Database className="w-3 h-3 mr-1" />
              Database
            </Badge>
          </CardTitle>
          <CardDescription>View and manage all customer orders from database</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search by order #, customer email, or product..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-10 bg-muted/50 border-border"
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[180px] bg-muted/50 border-border">
                <SelectValue placeholder="All Statuses" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
                <SelectItem value="refunded">Refunded</SelectItem>
                <SelectItem value="cancelled">Cancelled</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {filteredOrders.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              No orders found.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="border-border/50">
                    <TableHead className="text-muted-foreground">Order ID</TableHead>
                    <TableHead className="text-muted-foreground">Customer</TableHead>
                    <TableHead className="text-muted-foreground">Type</TableHead>
                    <TableHead className="text-muted-foreground">Amount</TableHead>
                    <TableHead className="text-muted-foreground">Status</TableHead>
                    <TableHead className="text-muted-foreground">Date</TableHead>
                    <TableHead className="text-muted-foreground">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredOrders.map((order) => (
                    <TableRow key={order.id} className="border-border/50 hover:bg-muted/30">
                      <TableCell className="font-mono text-xs">{order.id.slice(0, 8)}...</TableCell>
                      <TableCell>{maskEmail(order.user_email)}</TableCell>
                      <TableCell>{order.type.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}</TableCell>
                      <TableCell className="font-medium">
                        {order.currency} ${Number(order.amount || 0).toFixed(2)}
                      </TableCell>
                      <TableCell>{getStatusBadge(order.status)}</TableCell>
                      <TableCell>{order.created_at ? format(new Date(order.created_at), 'dd/MM/yyyy') : '-'}</TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          <Button variant="ghost" size="sm" className="text-primary hover:text-primary/80" onClick={() => { setSelectedOrder(order); setViewDialogOpen(true); }}>
                            View
                          </Button>
                          {order.status === 'completed' && (
                            <Button 
                              variant="ghost" 
                              size="sm" 
                              className="text-destructive hover:text-destructive/80"
                              onClick={() => handleRefundClick(order)}
                            >
                              Refund
                            </Button>
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

      <Dialog open={refundDialogOpen} onOpenChange={setRefundDialogOpen}>
        <DialogContent className="glass border-border">
          <DialogHeader>
            <DialogTitle>Confirm Refund</DialogTitle>
            <DialogDescription>
              This will process a refund via Stripe for order {selectedOrder?.id.slice(0, 8)}.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <p className="text-sm text-muted-foreground">
              Customer: <span className="text-foreground">{maskEmail(selectedOrder?.user_email)}</span>
            </p>
            <p className="text-sm text-muted-foreground">
              Amount: <span className="text-foreground font-medium">{selectedOrder?.currency} ${Number(selectedOrder?.amount || 0).toFixed(2)}</span>
            </p>
            <p className="text-sm text-muted-foreground">
              Type: <span className="text-foreground">{selectedOrder?.type?.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}</span>
            </p>
            {selectedOrder?.stripe_payment_id && (
              <p className="text-sm text-muted-foreground">
                Stripe Payment: <span className="text-foreground font-mono text-xs">{selectedOrder.stripe_payment_id}</span>
              </p>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setRefundDialogOpen(false)}>
              Cancel
            </Button>
            <Button 
              variant="destructive" 
              onClick={handleStripeRefund}
              disabled={refundLoading}
            >
              {refundLoading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              Process Refund
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={viewDialogOpen} onOpenChange={setViewDialogOpen}>
        <DialogContent className="glass border-border">
          <DialogHeader>
            <DialogTitle>Order Details</DialogTitle>
          </DialogHeader>
          <div className="space-y-3 py-2">
            <div className="grid grid-cols-3 gap-2 text-sm">
              <span className="text-muted-foreground">ID</span>
              <span className="col-span-2 font-mono text-xs">{selectedOrder?.id}</span>
            </div>
            <div className="grid grid-cols-3 gap-2 text-sm">
              <span className="text-muted-foreground">User ID</span>
              <span className="col-span-2 font-mono text-xs">{selectedOrder?.user_id}</span>
            </div>
            <div className="grid grid-cols-3 gap-2 text-sm">
              <span className="text-muted-foreground">Email</span>
              <span className="col-span-2">{maskEmail(selectedOrder?.user_email)}</span>
            </div>
            <div className="grid grid-cols-3 gap-2 text-sm">
              <span className="text-muted-foreground">Type</span>
              <span className="col-span-2">{selectedOrder?.type?.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}</span>
            </div>
            <div className="grid grid-cols-3 gap-2 text-sm">
              <span className="text-muted-foreground">Amount</span>
              <span className="col-span-2 font-medium">{selectedOrder?.currency} ${Number(selectedOrder?.amount || 0).toFixed(2)}</span>
            </div>
            <div className="grid grid-cols-3 gap-2 text-sm">
              <span className="text-muted-foreground">Status</span>
              <span className="col-span-2">{getStatusBadge(selectedOrder?.status || '')}</span>
            </div>
            <div className="grid grid-cols-3 gap-2 text-sm">
              <span className="text-muted-foreground">Stripe Payment</span>
              <span className="col-span-2 font-mono text-xs">{selectedOrder?.stripe_payment_id || '-'}</span>
            </div>
            <div className="grid grid-cols-3 gap-2 text-sm">
              <span className="text-muted-foreground">Created</span>
              <span className="col-span-2">{selectedOrder?.created_at ? format(new Date(selectedOrder.created_at), 'dd/MM/yyyy HH:mm') : '-'}</span>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setViewDialogOpen(false)}>Close</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
