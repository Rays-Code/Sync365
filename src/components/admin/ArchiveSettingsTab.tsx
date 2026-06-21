import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Loader2, Archive, Save, CheckCircle2, Clock, User } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { format } from 'date-fns';

const ARCHIVABLE_TABLES = [
  'symptom_logs',
  'predictions',
  'lifestyle_logs',
];

export default function ArchiveSettingsTab() {
  const [retentionMonths, setRetentionMonths] = useState('36');
  const [savedValue, setSavedValue] = useState('36');
  const [updatedAt, setUpdatedAt] = useState<string | null>(null);
  const [updatedByEmail, setUpdatedByEmail] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [runningArchive, setRunningArchive] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    fetchSetting();
  }, []);

  const fetchSetting = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('app_settings')
        .select('*')
        .eq('setting_key', 'archive_retention_months')
        .maybeSingle();

      if (error) throw error;

      if (data) {
        setRetentionMonths(data.setting_value);
        setSavedValue(data.setting_value);
        setUpdatedAt(data.updated_at);

        if (data.updated_by) {
          setUpdatedByEmail(data.updated_by.slice(0, 8));
        }
      }
    } catch (err: any) {
      console.error('Error fetching archive setting:', err);
      toast({ title: 'Error', description: 'Failed to load archive settings', variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    const months = parseInt(retentionMonths);
    if (isNaN(months) || months < 1 || months > 120) {
      toast({ title: 'Invalid value', description: 'Retention period must be between 1 and 120 months', variant: 'destructive' });
      return;
    }

    setSaving(true);
    try {
      const { data: session } = await supabase.auth.getSession();
      const userId = session.session?.user?.id;

      const { error } = await supabase
        .from('app_settings')
        .update({
          setting_value: months.toString(),
          updated_at: new Date().toISOString(),
          updated_by: userId || null,
        })
        .eq('setting_key', 'archive_retention_months');

      if (error) throw error;

      setSavedValue(months.toString());
      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 4000);

      toast({
        title: 'Archive settings saved',
        description: `Data older than ${months} months will be archived.`,
      });

      fetchSetting();
    } catch (err: any) {
      toast({ title: 'Save failed', description: err.message, variant: 'destructive' });
    } finally {
      setSaving(false);
    }
  };

  const handleRunArchiveNow = async () => {
    setRunningArchive(true);
    try {
      const { data: session } = await supabase.auth.getSession();
      const headers = session.session ? { Authorization: `Bearer ${session.session.access_token}` } : {};

      const res = await supabase.functions.invoke('archive-old-data', {
        body: {},
        headers,
      });

      if (res.error) throw new Error(res.error.message);

      const results = res.data?.results || {};
      const summary = Object.entries(results)
        .map(([table, count]) => `${table}: ${count} archived`)
        .join(', ');

      toast({
        title: 'Archive complete',
        description: summary || 'No records needed archiving.',
      });
    } catch (err: any) {
      toast({ title: 'Archive failed', description: err.message, variant: 'destructive' });
    } finally {
      setRunningArchive(false);
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

  const hasChanges = retentionMonths !== savedValue;

  return (
    <div className="space-y-6">
      {/* Retention Period Setting */}
      <Card className="glass border-border/50">
        <CardHeader>
          <CardTitle className="font-heading text-2xl flex items-center gap-2">
            <Archive className="w-6 h-6 text-primary" />
            Archive Retention Period
          </CardTitle>
          <CardDescription>
            Configure how long user health data is kept active before being archived.
            Archived data is hidden from normal app views but can be accessed by premium subscribers.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="max-w-md space-y-3">
            <Label htmlFor="retention-months" className="text-sm font-medium">
              Archive data older than (months)
            </Label>
            <div className="flex items-center gap-3">
              <Input
                id="retention-months"
                type="number"
                min={1}
                max={120}
                value={retentionMonths}
                onChange={(e) => setRetentionMonths(e.target.value)}
                className="bg-muted/50 border-border w-32"
              />
              <span className="text-sm text-muted-foreground">
                months ({Math.floor(parseInt(retentionMonths || '0') / 12)} years, {parseInt(retentionMonths || '0') % 12} months)
              </span>
            </div>
            <p className="text-xs text-muted-foreground">
              Records older than this period will be flagged as archived. Range: 1�120 months.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Button
              onClick={handleSave}
              disabled={saving || !hasChanges}
              className="btn-cosmic text-primary-foreground"
            >
              {saving ? (
                <Loader2 className="w-4 h-4 animate-spin mr-2" />
              ) : (
                <Save className="w-4 h-4 mr-2" />
              )}
              Save Settings
            </Button>

            {showSuccess && (
              <span className="flex items-center gap-1.5 text-sm text-primary animate-fade-in">
                <CheckCircle2 className="w-4 h-4" />
                Saved � archiving data older than {savedValue} months
              </span>
            )}
          </div>

          {/* Last updated info */}
          {updatedAt && (
            <div className="flex items-center gap-4 pt-2 border-t border-border/30 text-sm text-muted-foreground">
              <span className="flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5" />
                Last updated: {format(new Date(updatedAt), 'dd MMM yyyy, hh:mm a')}
              </span>
              {updatedByEmail && (
                <span className="flex items-center gap-1.5">
                  <User className="w-3.5 h-3.5" />
                  By: {updatedByEmail}
                </span>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Affected Tables */}
      <Card className="glass border-border/50">
        <CardHeader>
          <CardTitle className="font-heading text-lg">Affected Tables</CardTitle>
          <CardDescription>
            The following user health data tables have archival enabled via the <code>is_archived</code> column.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
            {ARCHIVABLE_TABLES.map((table) => (
              <div key={table} className="flex items-center gap-2 bg-muted/30 rounded-md px-3 py-2 text-sm border border-border/30">
                <div className="w-2 h-2 rounded-full bg-primary/60" />
                <span className="font-mono text-xs">{table}</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Manual Archive Run */}
      <Card className="glass border-border/50">
        <CardHeader>
          <CardTitle className="font-heading text-lg">Manual Archive</CardTitle>
          <CardDescription>
            The archive job runs automatically daily at 2:00 AM UTC via a scheduled task.
            You can also trigger it manually here.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button
            onClick={handleRunArchiveNow}
            disabled={runningArchive}
            variant="outline"
            className="border-border hover:bg-muted/50"
          >
            {runningArchive ? (
              <Loader2 className="w-4 h-4 animate-spin mr-2" />
            ) : (
              <Archive className="w-4 h-4 mr-2" />
            )}
            Run Archive Now
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
