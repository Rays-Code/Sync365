import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Loader2, RefreshCw, Search, Pencil, Save } from 'lucide-react';

interface DoctorQuestion {
  id: string;
  question_text: string;
  category: string;
  applicable_age_range: string | null;
  applicable_conditions: string[] | null;
  applicable_life_stages: string[] | null;
  is_active: boolean;
  sort_order: number;
  created_at: string;
  updated_at: string;
}

const CATEGORIES = ['general', 'ivf_process', 'costs', 'timeline', 'risks', 'success_rates', 'lifestyle', 'male_fertility', 'emotional'];

export default function DoctorQuestionsManager() {
  const [questions, setQuestions] = useState<DoctorQuestion[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [search, setSearch] = useState('');
  const [filterCategory, setFilterCategory] = useState('all');
  const [editItem, setEditItem] = useState<DoctorQuestion | null>(null);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const { data: sessionData } = await supabase.auth.getSession();
      const response = await supabase.functions.invoke('external-db-query', {
        body: { table: 'doctor_question_templates', limit: 500 },
        headers: sessionData.session ? { Authorization: `Bearer ${sessionData.session.access_token}` } : {},
      });
      if (response.error) throw new Error(response.error.message);
      setQuestions(response.data.data || []);
    } catch (err: any) {
      toast.error('Failed to fetch doctor questions');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  const handleSave = async (item: DoctorQuestion) => {
    setSaving(true);
    try {
      const { data: sessionData } = await supabase.auth.getSession();
      const { id, created_at, updated_at, ...updateData } = item;
      const response = await supabase.functions.invoke('external-db-mutate', {
        body: { table: 'doctor_question_templates', operation: 'update', id, data: { ...updateData, updated_at: new Date().toISOString() } },
        headers: sessionData.session ? { Authorization: `Bearer ${sessionData.session.access_token}` } : {},
      });
      if (response.error) throw new Error(response.error.message);
      toast.success('Question updated');
      setEditItem(null);
      fetchData();
    } catch (err: any) {
      toast.error('Failed to update: ' + err.message);
    } finally {
      setSaving(false);
    }
  };

  const filtered = questions.filter(q => {
    const matchesSearch = !search || q.question_text.toLowerCase().includes(search.toLowerCase());
    const matchesCat = filterCategory === 'all' || q.category === filterCategory;
    return matchesSearch && matchesCat;
  });

  if (loading) {
    return <div className="flex justify-center py-12"><Loader2 className="w-6 h-6 animate-spin text-primary" /></div>;
  }

  return (
    <Card className="bg-card/50 border-border/50">
      <CardHeader>
        <div className="flex items-center justify-between flex-wrap gap-4">
          <CardTitle className="text-foreground">Doctor Questions ({questions.length})</CardTitle>
          <Button variant="outline" size="sm" onClick={fetchData}><RefreshCw className="w-4 h-4 mr-1" />Refresh</Button>
        </div>
        <div className="flex items-center gap-3 mt-4">
          <div className="relative flex-1 max-w-xs">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input placeholder="Search questions..." value={search} onChange={e => setSearch(e.target.value)} className="pl-9" />
          </div>
          <Select value={filterCategory} onValueChange={setFilterCategory}>
            <SelectTrigger className="w-40"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Categories</SelectItem>
              {CATEGORIES.map(c => <SelectItem key={c} value={c}>{c.replace(/_/g, ' ')}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>
      </CardHeader>
      <CardContent>
        <div className="overflow-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-8">#</TableHead>
                <TableHead>Question</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Age Range</TableHead>
                <TableHead>Active</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.sort((a, b) => a.sort_order - b.sort_order).map(q => (
                <TableRow key={q.id}>
                  <TableCell className="text-muted-foreground">{q.sort_order}</TableCell>
                  <TableCell className="max-w-md truncate">{q.question_text}</TableCell>
                  <TableCell><Badge variant="outline" className="capitalize">{q.category?.replace(/_/g, ' ')}</Badge></TableCell>
                  <TableCell>{q.applicable_age_range || '�'}</TableCell>
                  <TableCell><Badge variant={q.is_active ? 'default' : 'secondary'}>{q.is_active ? 'Yes' : 'No'}</Badge></TableCell>
                  <TableCell>
                    <Button variant="ghost" size="sm" onClick={() => setEditItem(q)}><Pencil className="w-4 h-4" /></Button>
                  </TableCell>
                </TableRow>
              ))}
              {filtered.length === 0 && (
                <TableRow><TableCell colSpan={6} className="text-center text-muted-foreground py-8">No questions found</TableCell></TableRow>
              )}
            </TableBody>
          </Table>
        </div>

        <Dialog open={!!editItem} onOpenChange={open => !open && setEditItem(null)}>
          <DialogContent className="max-w-lg">
            <DialogHeader><DialogTitle>Edit Question</DialogTitle></DialogHeader>
            {editItem && (
              <div className="grid gap-3">
                <div><Label>Question Text</Label><Textarea rows={3} value={editItem.question_text} onChange={e => setEditItem(p => p ? { ...p, question_text: e.target.value } : null)} /></div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Label>Category</Label>
                    <Select value={editItem.category} onValueChange={v => setEditItem(p => p ? { ...p, category: v } : null)}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>{CATEGORIES.map(c => <SelectItem key={c} value={c}>{c.replace(/_/g, ' ')}</SelectItem>)}</SelectContent>
                    </Select>
                  </div>
                  <div><Label>Age Range</Label><Input value={editItem.applicable_age_range ?? ''} onChange={e => setEditItem(p => p ? { ...p, applicable_age_range: e.target.value || null } : null)} placeholder="e.g. 25-35" /></div>
                </div>
                <div><Label>Sort Order</Label><Input type="number" value={editItem.sort_order} onChange={e => setEditItem(p => p ? { ...p, sort_order: Number(e.target.value) } : null)} /></div>
                <div className="flex items-center gap-2">
                  <Switch checked={editItem.is_active} onCheckedChange={v => setEditItem(p => p ? { ...p, is_active: v } : null)} />
                  <Label>Active</Label>
                </div>
              </div>
            )}
            <DialogFooter>
              <Button variant="outline" onClick={() => setEditItem(null)}>Cancel</Button>
              <Button onClick={() => editItem && handleSave(editItem)} disabled={saving}>
                {saving && <Loader2 className="w-4 h-4 mr-1 animate-spin" />}<Save className="w-4 h-4 mr-1" />Save
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </CardContent>
    </Card>
  );
}
