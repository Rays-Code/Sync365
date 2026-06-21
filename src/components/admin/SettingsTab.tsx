import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import DOMPurify from 'dompurify';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Loader2, Settings, FileText, Download, ExternalLink, Edit } from 'lucide-react';
import { format } from 'date-fns';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';

interface ContentPage {
  id: string;
  slug: string;
  title: string;
  content: string | null;
  meta_description: string | null;
  is_published: boolean;
  updated_at: string;
}

export default function SettingsTab() {
  const [pages, setPages] = useState<ContentPage[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingPage, setEditingPage] = useState<ContentPage | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const { toast } = useToast();

  // Stats
  const [stats, setStats] = useState({
    users: 0,
    orders: 0,
    subscriptions: 0,
  });

  useEffect(() => {
    fetchPages();
    fetchStats();
  }, []);

  const fetchPages = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('content_pages')
      .select('*')
      .order('title');

    if (error) {
      console.error('Error fetching pages:', error);
    } else {
      setPages(data || []);
    }
    setLoading(false);
  };

  const fetchStats = async () => {
    try {
      const { data: sessionData } = await supabase.auth.getSession();
      const headers = sessionData.session ? {
        Authorization: `Bearer ${sessionData.session.access_token}`,
      } : {};

      // Fetch stats via Supabase edge functions
      const [ordersRes, subsRes] = await Promise.all([
        supabase.functions.invoke('external-db-query', {
          body: { table: 'orders', limit: 1, offset: 0 },
          headers,
        }),
        supabase.functions.invoke('external-db-query', {
          body: { table: 'subscriptions', limit: 1, offset: 0 },
          headers,
        }),
      ]);

      // Get profiles count from Supabase
      const profilesResult = await supabase.from('profiles').select('id', { count: 'exact', head: true });

      setStats({
        users: profilesResult.count || 0,
        orders: ordersRes.data?.count || 0,
        subscriptions: subsRes.data?.count || 0,
      });
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  const handleSavePage = async () => {
    if (!editingPage) return;

    const sanitizedContent = DOMPurify.sanitize(editingPage.content || '', {
      ALLOWED_TAGS: ['h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'p', 'a', 'ul', 'ol', 'li', 'strong', 'em', 'br', 'div', 'span', 'blockquote', 'hr', 'table', 'thead', 'tbody', 'tr', 'th', 'td'],
      ALLOWED_ATTR: ['href', 'target', 'class', 'rel']
    });

    const { error } = await supabase
      .from('content_pages')
      .update({
        title: editingPage.title,
        content: sanitizedContent,
        meta_description: editingPage.meta_description,
        is_published: editingPage.is_published,
      })
      .eq('id', editingPage.id);

    if (error) {
      toast({
        title: 'Failed to save',
        description: error.message,
        variant: 'destructive',
      });
    } else {
      toast({
        title: 'Page saved',
        description: 'Content has been updated.',
      });
      setDialogOpen(false);
      fetchPages();
    }
  };

  const exportData = async (table: string) => {
    try {
      const { data: sessionData } = await supabase.auth.getSession();
      const headers = sessionData.session ? {
        Authorization: `Bearer ${sessionData.session.access_token}`,
      } : {};

      let data: any[] = [];

      if (table === 'profiles') {
        // Profiles are stored in Supabase
        const result = await supabase.from('profiles').select('*');
        if (result.error) throw result.error;
        data = result.data || [];
      } else {
        // Other tables queried via Supabase edge functions
        const response = await supabase.functions.invoke('external-db-query', {
          body: { table, limit: 500, offset: 0 },
          headers,
        });
        if (response.error) throw response.error;
        data = response.data?.data || [];
      }

      if (data.length === 0) {
        toast({
          title: 'No data to export',
          description: `No ${table} records found.`,
        });
        return;
      }

      // Convert to CSV
      const csvHeaders = Object.keys(data[0]).join(',');
      const rows = data.map(row => Object.values(row).map(val => 
        typeof val === 'string' ? `"${val.replace(/"/g, '""')}"` : val
      ).join(','));
      const csv = [csvHeaders, ...rows].join('\n');

      // Download
      const blob = new Blob([csv], { type: 'text/csv' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${table}_export_${format(new Date(), 'yyyy-MM-dd')}.csv`;
      a.click();
      URL.revokeObjectURL(url);

      toast({
        title: 'Export complete',
        description: `${data.length} records exported.`,
      });
    } catch (error: any) {
      toast({
        title: 'Export failed',
        description: error.message,
        variant: 'destructive',
      });
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
    <div className="space-y-6">
      {/* Content Management */}
      <Card className="glass border-border/50">
        <CardHeader>
          <CardTitle className="font-heading text-2xl flex items-center gap-2">
            <FileText className="w-6 h-6 text-primary" />
            Content Management
          </CardTitle>
          <CardDescription>
            Edit page content directly from here. Changes are saved to the database and reflected immediately.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {pages.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              No content pages found. Add some pages to manage content.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="border-border/50">
                    <TableHead className="text-muted-foreground">Page</TableHead>
                    <TableHead className="text-muted-foreground">Route</TableHead>
                    <TableHead className="text-muted-foreground">Last Updated</TableHead>
                    <TableHead className="text-muted-foreground">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {pages.map((page) => (
                    <TableRow key={page.id} className="border-border/50 hover:bg-muted/30">
                      <TableCell className="font-medium">{page.title}</TableCell>
                      <TableCell className="font-mono text-sm text-muted-foreground">/{page.slug}</TableCell>
                      <TableCell>{format(new Date(page.updated_at), 'dd MMM yyyy, hh:mm a')}</TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          <Dialog open={dialogOpen && editingPage?.id === page.id} onOpenChange={(open) => {
                            setDialogOpen(open);
                            if (open) setEditingPage(page);
                          }}>
                            <DialogTrigger asChild>
                              <Button variant="ghost" size="sm" className="text-primary hover:text-primary/80">
                                <Edit className="w-4 h-4 mr-1" />
                                Edit
                              </Button>
                            </DialogTrigger>
                            <DialogContent className="glass border-border/50 max-w-2xl">
                              <DialogHeader>
                                <DialogTitle className="font-heading">Edit {editingPage?.title}</DialogTitle>
                              </DialogHeader>
                              {editingPage && (
                                <div className="space-y-4 mt-4">
                                  <div className="space-y-2">
                                    <Label>Title</Label>
                                    <Input
                                      value={editingPage.title}
                                      onChange={(e) => setEditingPage({ ...editingPage, title: e.target.value })}
                                      className="bg-muted/50 border-border"
                                    />
                                  </div>
                                  <div className="space-y-2">
                                    <Label>Meta Description</Label>
                                    <Input
                                      value={editingPage.meta_description || ''}
                                      onChange={(e) => setEditingPage({ ...editingPage, meta_description: e.target.value })}
                                      className="bg-muted/50 border-border"
                                    />
                                  </div>
                                  <div className="space-y-2">
                                    <Label>Content</Label>
                                    <Textarea
                                      value={editingPage.content || ''}
                                      onChange={(e) => setEditingPage({ ...editingPage, content: e.target.value })}
                                      className="bg-muted/50 border-border min-h-[200px]"
                                    />
                                  </div>
                                  <Button onClick={handleSavePage} className="w-full btn-cosmic text-primary-foreground">
                                    Save Changes
                                  </Button>
                                </div>
                              )}
                            </DialogContent>
                          </Dialog>
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            className="text-muted-foreground hover:text-foreground"
                            onClick={() => window.open(`/page/${page.slug}`, '_blank')}
                          >
                            <ExternalLink className="w-4 h-4 mr-1" />
                            Preview
                          </Button>
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

      {/* Data Export */}
      <Card className="glass border-border/50">
        <CardHeader>
          <CardTitle className="font-heading text-2xl flex items-center gap-2">
            <Download className="w-6 h-6 text-primary" />
            Data Export
          </CardTitle>
          <CardDescription>
            Export platform data to CSV format
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card className="bg-muted/30 border-border/50">
              <CardContent className="pt-6">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h4 className="font-medium">Export Users</h4>
                    <p className="text-sm text-muted-foreground">{stats.users} records</p>
                  </div>
                </div>
                <Button 
                  onClick={() => exportData('profiles')} 
                  variant="outline" 
                  className="w-full border-border hover:bg-muted/50"
                >
                  <Download className="w-4 h-4 mr-2" />
                  Export
                </Button>
              </CardContent>
            </Card>

            <Card className="bg-muted/30 border-border/50">
              <CardContent className="pt-6">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h4 className="font-medium">Export Orders</h4>
                    <p className="text-sm text-muted-foreground">{stats.orders} records</p>
                  </div>
                </div>
                <Button 
                  onClick={() => exportData('orders')} 
                  variant="outline" 
                  className="w-full border-border hover:bg-muted/50"
                >
                  <Download className="w-4 h-4 mr-2" />
                  Export
                </Button>
              </CardContent>
            </Card>

            <Card className="bg-muted/30 border-border/50">
              <CardContent className="pt-6">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h4 className="font-medium">Export Subscriptions</h4>
                    <p className="text-sm text-muted-foreground">{stats.subscriptions} records</p>
                  </div>
                </div>
                <Button 
                  onClick={() => exportData('subscriptions')} 
                  variant="outline" 
                  className="w-full border-border hover:bg-muted/50"
                >
                  <Download className="w-4 h-4 mr-2" />
                  Export
                </Button>
              </CardContent>
            </Card>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
