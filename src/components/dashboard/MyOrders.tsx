import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ShoppingBag, Package, Loader2 } from 'lucide-react';
import { userGetBillingAccount } from '@/services/supabaseFunctions';

export default function MyOrders({ userId }: { userId: string }) {
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchOrders();
  }, [userId]);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const res = await userGetBillingAccount('get-orders', userId);
      setOrders(res?.orders || []);
    } catch (err: any) {
      console.error('Orders fetch error:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="glass border-border/50">
      <CardHeader>
        <CardTitle className="font-heading text-xl flex items-center gap-2">
          <ShoppingBag className="w-5 h-5 text-primary" />
          My Orders
        </CardTitle>
        <CardDescription>Your purchase history</CardDescription>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="flex justify-center py-8">
            <Loader2 className="w-6 h-6 animate-spin text-primary" />
          </div>
        ) : orders.length > 0 ? (
          <div className="space-y-3">
            {orders.map((order: any, i: number) => (
              <div key={i} className="flex items-center justify-between p-3 rounded-lg bg-muted/30 border border-border/50">
                <div>
                  <p className="text-sm font-medium">{order.product_name || order.id || `Order #${i + 1}`}</p>
                  <p className="text-xs text-muted-foreground">{order.created_at ? new Date(order.created_at).toLocaleDateString() : 'N/A'}</p>
                </div>
                <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                  order.status === 'completed' ? 'bg-green-500/20 text-green-400' : 'bg-muted text-muted-foreground'
                }`}>
                  {order.status || 'pending'}
                </span>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8">
            <Package className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
            <p className="text-muted-foreground">No orders yet.</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
