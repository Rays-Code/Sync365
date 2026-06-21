import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Loader2, ArrowLeftRight, Search, Database } from 'lucide-react';
import { format } from 'date-fns';
import { toast } from 'sonner';
import { maskEmail } from '@/lib/mask-email';

interface Transaction {
  id: string;
  user_email: string;
  type: 'payment' | 'refund' | 'subscription';
  amount: number;
  currency: string;
  status: 'pending' | 'completed' | 'failed';
  stripe_id: string | null;
  created_at: string;
}

export default function TransactionsTab() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  useEffect(() => {
    fetchTransactions();
  }, []);

  const fetchTransactions = async () => {
    setLoading(true);
    try {
      const { data: sessionData } = await supabase.auth.getSession();
      
      const response = await supabase.functions.invoke('external-db-query', {
        body: { table: 'transactions', limit: 200, offset: 0 },
        headers: sessionData.session ? {
          Authorization: `Bearer ${sessionData.session.access_token}`,
        } : {},
      });

      if (response.error) {
        throw new Error(response.error.message);
      }

      setTransactions(response.data.data || []);
    } catch (error: any) {
      console.error('Error fetching transactions:', error);
      toast.error('Failed to fetch transactions from database');
    }
    setLoading(false);
  };

  const filteredTransactions = transactions.filter((tx) => {
    const matchesSearch = 
      tx.id?.toLowerCase().includes(search.toLowerCase()) ||
      tx.user_email?.toLowerCase().includes(search.toLowerCase());
    const matchesType = typeFilter === 'all' || tx.type === typeFilter;
    const matchesStatus = statusFilter === 'all' || tx.status === statusFilter;
    return matchesSearch && matchesType && matchesStatus;
  });

  const getTypeBadge = (type: Transaction['type']) => {
    const styles: Record<Transaction['type'], string> = {
      payment: 'bg-accent/20 text-accent',
      refund: 'bg-destructive/20 text-destructive',
      subscription: 'bg-primary/20 text-primary',
    };
    return <Badge className={styles[type]}>{type}</Badge>;
  };

  const getStatusBadge = (status: Transaction['status']) => {
    const styles: Record<Transaction['status'], string> = {
      pending: 'bg-cosmic-gold/20 text-cosmic-gold border border-cosmic-gold/30',
      completed: 'bg-accent text-accent-foreground',
      failed: 'bg-destructive/20 text-destructive',
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
    <Card className="glass border-border/50">
      <CardHeader>
        <CardTitle className="font-heading text-2xl flex items-center gap-2">
          <ArrowLeftRight className="w-6 h-6 text-primary" />
          Transactions
          <Badge variant="outline" className="ml-2 border-purple-500 text-purple-500">
            <Database className="w-3 h-3 mr-1" />
            Database
          </Badge>
        </CardTitle>
        <CardDescription>View all transactions from database</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search by transaction ID or user email..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10 bg-muted/50 border-border"
            />
          </div>
          <Select value={typeFilter} onValueChange={setTypeFilter}>
            <SelectTrigger className="w-[150px] bg-muted/50 border-border">
              <SelectValue placeholder="All Types" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Types</SelectItem>
              <SelectItem value="payment">Payment</SelectItem>
              <SelectItem value="refund">Refund</SelectItem>
              <SelectItem value="subscription">Subscription</SelectItem>
            </SelectContent>
          </Select>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-[150px] bg-muted/50 border-border">
              <SelectValue placeholder="All Statuses" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Statuses</SelectItem>
              <SelectItem value="pending">Pending</SelectItem>
              <SelectItem value="completed">Completed</SelectItem>
              <SelectItem value="failed">Failed</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {filteredTransactions.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground">
            No transactions found.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="border-border/50">
                  <TableHead className="text-muted-foreground">Transaction ID</TableHead>
                  <TableHead className="text-muted-foreground">User</TableHead>
                  <TableHead className="text-muted-foreground">Type</TableHead>
                  <TableHead className="text-muted-foreground">Amount</TableHead>
                  <TableHead className="text-muted-foreground">Status</TableHead>
                  <TableHead className="text-muted-foreground">Provider</TableHead>
                  <TableHead className="text-muted-foreground">Date</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredTransactions.map((tx) => (
                  <TableRow key={tx.id} className="border-border/50 hover:bg-muted/30">
                    <TableCell className="font-mono text-sm">
                      {tx.id?.substring(0, 8)}...
                    </TableCell>
                    <TableCell>{maskEmail(tx.user_email)}</TableCell>
                    <TableCell>{getTypeBadge(tx.type)}</TableCell>
                    <TableCell className={`font-medium ${tx.type === 'refund' ? 'text-destructive' : ''}`}>
                      {tx.type === 'refund' ? '-' : ''}${Math.abs(Number(tx.amount || 0)).toFixed(2)}
                    </TableCell>
                    <TableCell>{getStatusBadge(tx.status)}</TableCell>
                    <TableCell>{tx.stripe_id ? tx.stripe_id.substring(0, 12) + '...' : '-'}</TableCell>
                    <TableCell>{tx.created_at ? format(new Date(tx.created_at), 'dd/MM/yyyy') : '-'}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
