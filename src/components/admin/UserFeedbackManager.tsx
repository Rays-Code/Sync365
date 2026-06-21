import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Loader2, RefreshCw, Search, Eye, Save } from 'lucide-react';

interface UserFeedback {
  id: string;
  user_id: string | null;
  screen_name: string | null;
  feedback_type: string | null;
  details: string | null;
  context_data: any;
  user_country: string | null;
  user_age_group: string | null;
  status: string;
  admin_notes: string | null;
  created_at: string;
  updated_at: string;
}

const STATUS_OPTIONS = ['new', 'reviewed', 'resolved'];
const STATUS_COLORS: Record<string, 'default' | 'secondary' | 'destructive' | 'outline'> = {
  new: 'destructive',
  reviewed: 'secondary',
  resolved: 'default',
};

export default function UserFeedbackManager() {
  const [feedback, setFeedback] = useState<UserFeedback[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [viewItem, setViewItem] = useState<UserFeedback | null>(null);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const { data: sessionData } = await supabase.auth.getSession();
      const response = await supabase.functions.invoke('external-db-query', {
        body: { table: 'user_feedback', limit: 500 },
        headers: sessionData.session ? { Authorization: `Bearer ${sessionData.session.access_token}` } : {},
      });
      if (response.error) throw new Error(response.error.message);
      setFeedback(response.data.data || []);
    } catch (err: any) {
      toast.error('Failed to fetch feedback');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  const handleUpdateStatus = async (item: UserFeedback, newStatus: string, adminNotes?: string) => {
    setSaving(true);
    try {
      const { data: sessionData } = await supabase.auth.getSession();
      const response = await supabase.functions.invoke('external-db-mutate', {
        body: {
          table: 'user_feedback', operation: 'update', id: item.id,
          data: { status: newStatus, admin_notes: adminNotes || item.admin_notes, updated_at: new Date().toISOString() }
        },
        headers: sessionData.session ? { Authorization: `Bearer ${sessionData.session.access_token}` } : {},
      });
      if (response.error) throw new Error(response.error.message);
      toast.success('Feedback updated');
      if (viewItem?.id === item.id) setViewItem(prev => prev ? { ...prev, status: newStatus, admin_notes: adminNotes || prev.admin_notes } : null);
      fetchData();
    } catch (err: any) {
      toast.error('Failed to update: ' + err.message);
    } finally {
      setSaving(false);
    }
  };

  const filtered = feedback.filter(f => {
    const matchesSearch = !search || f.details?.toLowerCase().includes(search.toLowerCase()) || f.screen_name?.toLowerCase().includes(search.toLowerCase()) || f.feedback_type?.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = filterStatus === 'all' || f.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  const newCount = feedback.filter(f => f.status === 'new').length;

  if (loading) {
    return <div className="flex justify-center py-12"><Loader2 className="w-6 h-6 animate-spin text-primary" /></div>;
  }

  return (
    <Card className="bg-card/50 border-border/50">
      <CardHeader>
        <div className="flex items-center justify-between flex-wrap gap-4">
          <CardTitle className="text-foreground flex items-center gap-2">
            User Feedback ({feedback.length})
            {newCount > 0 && <Badge variant="destructive">{newCount} new</Badge>}
          </CardTitle>
          <Button variant="outline" size="sm" onClick={fetchData}><RefreshCw className="w-4 h-4 mr-1" />Refresh</Button>
        </div>
        <div className="flex items-center gap-3 mt-4">
          <div className="relative flex-1 max-w-xs">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input placeholder="Search feedback..." value={search} onChange={e => setSearch(e.target.value)} className="pl-9" />
          </div>
          <Select value={filterStatus} onValueChange={setFilterStatus}>
            <SelectTrigger className="w-36"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              {STATUS_OPTIONS.map(s => <SelectItem key={s} value={s} className="capitalize">{s}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>
      </CardHeader>
      <CardContent>
        <div className="overflow-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Date</TableHead>
                <TableHead>Screen</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Country</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map(f => (
                <TableRow key={f.id}>
                  <TableCell className="text-muted-foreground text-xs">{new Date(f.created_at).toLocaleDateString()}</TableCell>
                  <TableCell>{f.screen_name || '�'}</TableCell>
                  <TableCell><Badge variant="outline" className="capitalize">{f.feedback_type?.replace(/_/g, ' ') || '�'}</Badge></TableCell>
                  <TableCell>{f.user_country || '�'}</TableCell>
                  <TableCell><Badge variant={STATUS_COLORS[f.status] || 'outline'} className="capitalize">{f.status}</Badge></TableCell>
                  <TableCell>
                    <Button variant="ghost" size="sm" onClick={() => setViewItem(f)}><Eye className="w-4 h-4" /></Button>
                  </TableCell>
                </TableRow>
              ))}
              {filtered.length === 0 && (
                <TableRow><TableCell colSpan={6} className="text-center text-muted-foreground py-8">No feedback found</TableCell></TableRow>
              )}
            </TableBody>
          </Table>
        </div>

        <Dialog open={!!viewItem} onOpenChange={open => !open && setViewItem(null)}>
          <DialogContent className="max-w-lg">
            <DialogHeader><DialogTitle>Feedback Detail</DialogTitle></DialogHeader>
            {viewItem && (
              <div className="grid gap-3">
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div><span className="text-muted-foreground">Screen:</span> {viewItem.screen_name || '�'}</div>
                  <div><span className="text-muted-foreground">Type:</span> {viewItem.feedback_type?.replace(/_/g, ' ') || '�'}</div>
                  <div><span className="text-muted-foreground">Country:</span> {viewItem.user_country || '�'}</div>
                  <div><span className="text-muted-foreground">Age Group:</span> {viewItem.user_age_group || '�'}</div>
                  <div><span className="text-muted-foreground">Date:</span> {new Date(viewItem.created_at).toLocaleString()}</div>
                  <div><span className="text-muted-foreground">User ID:</span> {viewItem.user_id?.slice(0, 8) || 'anonymous'}...</div>
                </div>
                <div>
                  <Label>Details</Label>
                  <div className="mt-1 p-3 bg-muted/50 rounded-md text-sm whitespace-pre-wrap">{viewItem.details || 'No details provided'}</div>
                </div>
                {viewItem.context_data && (
                  <div>
                    <Label>Context Data</Label>
                    <pre className="mt-1 p-3 bg-muted/50 rounded-md text-xs overflow-auto max-h-32">{JSON.stringify(viewItem.context_data, null, 2)}</pre>
                  </div>
                )}
                <div>
                  <Label>Status</Label>
                  <Select value={viewItem.status} onValueChange={v => setViewItem(prev => prev ? { ...prev, status: v } : null)}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>{STATUS_OPTIONS.map(s => <SelectItem key={s} value={s} className="capitalize">{s}</SelectItem>)}</SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Admin Notes</Label>
                  <Textarea rows={3} value={viewItem.admin_notes ?? ''} onChange={e => setViewItem(prev => prev ? { ...prev, admin_notes: e.target.value } : null)} placeholder="Add internal notes..." />
                </div>
              </div>
            )}
            <DialogFooter>
              <Button variant="outline" onClick={() => setViewItem(null)}>Close</Button>
              <Button onClick={() => viewItem && handleUpdateStatus(viewItem, viewItem.status, viewItem.admin_notes ?? undefined)} disabled={saving}>
                {saving && <Loader2 className="w-4 h-4 mr-1 animate-spin" />}<Save className="w-4 h-4 mr-1" />Save
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </CardContent>
    </Card>
  );
}
