import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Loader2, Database, RefreshCw, Users, Activity, Brain, Heart, Calendar, ShoppingCart, CreditCard, Building, Ticket, FileText, Mail, UserCheck, Receipt, RotateCcw, Plus } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface TableConfig {
  value: string;
  label: string;
  icon: any;
  source: 'app' | 'website';
}

export default function AppDataTab() {
  const [appStats, setAppStats] = useState<Record<string, number>>({});
  const [websiteStats, setWebsiteStats] = useState<Record<string, number>>({});
  const [tableData, setTableData] = useState<any[]>([]);
  const [selectedTable, setSelectedTable] = useState('admin_users');
  const [loading, setLoading] = useState(true);
  const [tableLoading, setTableLoading] = useState(false);
  const [totalCount, setTotalCount] = useState(0);

  // Mobile app database tables
  const appTables: TableConfig[] = [
    { value: 'admin_users', label: 'App Users', icon: Users, source: 'app' },
    { value: 'symptom_logs', label: 'Symptom Logs', icon: Activity, source: 'app' },
    { value: 'predictions', label: 'Predictions', icon: Brain, source: 'app' },
    { value: 'lifestyle_logs', label: 'Lifestyle Logs', icon: Heart, source: 'app' },
    { value: 'cycles', label: 'Cycles', icon: Calendar, source: 'app' },
  ];

  // Website / platform tables
  const websiteTables: TableConfig[] = [
    { value: 'waitlist', label: 'Waitlist', icon: Mail, source: 'website' },
    { value: 'profiles', label: 'Profiles', icon: UserCheck, source: 'website' },
    { value: 'user_roles', label: 'User Roles', icon: Users, source: 'website' },
    { value: 'orders', label: 'Orders', icon: ShoppingCart, source: 'website' },
    { value: 'subscriptions', label: 'Subscriptions', icon: CreditCard, source: 'website' },
    { value: 'transactions', label: 'Transactions', icon: Receipt, source: 'website' },
    { value: 'corporate_partners', label: 'Corporate Partners', icon: Building, source: 'website' },
    { value: 'redemption_codes', label: 'Redemption Codes', icon: Ticket, source: 'website' },
    { value: 'refund_requests', label: 'Refund Requests', icon: RotateCcw, source: 'website' },
    { value: 'content_pages', label: 'Content Pages', icon: FileText, source: 'website' },
  ];

  const allTables = [...appTables, ...websiteTables];

  const fetchStats = async () => {
    try {
      const { data: sessionData } = await supabase.auth.getSession();
      
      const response = await supabase.functions.invoke('external-db-stats', {
        headers: sessionData.session ? {
          Authorization: `Bearer ${sessionData.session.access_token}`,
        } : {},
      });

      if (response.error) {
        throw new Error(response.error.message);
      }

      setAppStats(response.data.appStats || {});
      setWebsiteStats(response.data.websiteStats || {});
    } catch (error: any) {
      console.error('Error fetching stats:', error);
      toast.error('Failed to fetch database stats');
    } finally {
      setLoading(false);
    }
  };

  const fetchTableData = async (table: string) => {
    setTableLoading(true);
    try {
      const { data: sessionData } = await supabase.auth.getSession();

      const response = await supabase.functions.invoke('external-db-query', {
        body: { table, limit: 50, offset: 0 },
        headers: sessionData.session ? {
          Authorization: `Bearer ${sessionData.session.access_token}`,
        } : {},
      });

      if (response.error) {
        throw new Error(response.error.message);
      }

      setTableData(response.data.data || []);
      setTotalCount(response.data.count || 0);
    } catch (error: any) {
      console.error('Error fetching table data:', error);
      toast.error(`Failed to fetch ${table} data`);
      setTableData([]);
    } finally {
      setTableLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  useEffect(() => {
    if (selectedTable) {
      fetchTableData(selectedTable);
    }
  }, [selectedTable]);

  const handleRefresh = () => {
    setLoading(true);
    fetchStats();
    fetchTableData(selectedTable);
  };

  const [testEmail, setTestEmail] = useState('');
  const [testName, setTestName] = useState('');
  const [addingTest, setAddingTest] = useState(false);

  const handleAddTestWaitlist = async () => {
    if (!testEmail) {
      toast.error('Please enter an email');
      return;
    }
    setAddingTest(true);
    try {
      const { data: sessionData } = await supabase.auth.getSession();
      
      const response = await supabase.functions.invoke('external-db-mutate', {
        body: {
          operation: 'insert',
          table: 'waitlist',
          data: {
            email: testEmail,
            name: testName || 'Test User',
          }
        },
        headers: sessionData.session ? {
          Authorization: `Bearer ${sessionData.session.access_token}`,
        } : {},
      });

      if (response.error) {
        throw new Error(response.error.message);
      }

      toast.success('Test data added to the database!');
      setTestEmail('');
      setTestName('');
      handleRefresh();
    } catch (error: any) {
      console.error('Error adding test data:', error);
      toast.error('Failed to add test data: ' + error.message);
    } finally {
      setAddingTest(false);
    }
  };

  const getTableColumns = (data: any[]) => {
    if (!data || data.length === 0) return [];
    return Object.keys(data[0]).slice(0, 6);
  };

  const formatCellValue = (value: any) => {
    if (value === null || value === undefined) return '-';
    if (typeof value === 'boolean') return value ? 'Yes' : 'No';
    if (typeof value === 'object') return JSON.stringify(value).slice(0, 50) + '...';
    if (typeof value === 'string' && value.length > 50) return value.slice(0, 50) + '...';
    return String(value);
  };

  const getSelectedTableConfig = () => allTables.find(t => t.value === selectedTable);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Mobile App Database Tables Section */}
      <div>
        <div className="flex items-center gap-2 mb-4">
          <Badge variant="default" className="bg-blue-600 text-white">App Database</Badge>
          <span className="text-sm text-muted-foreground">Mobile app tables from Supabase</span>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          {appTables.map((table) => {
            const Icon = table.icon;
            const count = appStats[table.value] || 0;
            return (
              <Card 
                key={table.value} 
                className={`bg-card/50 border-blue-500/30 cursor-pointer transition-all hover:border-blue-500 ${selectedTable === table.value ? 'ring-2 ring-blue-500' : ''}`}
                onClick={() => setSelectedTable(table.value)}
              >
                <CardContent className="pt-6">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-blue-500/10">
                      <Icon className="w-5 h-5 text-blue-500" />
                    </div>
                    <div>
                      <p className="text-2xl font-bold text-foreground">{count.toLocaleString()}</p>
                      <p className="text-xs text-muted-foreground">{table.label}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>

      {/* Add Test Data Section */}
      <Card className="bg-card/50 border-green-500/30">
        <CardHeader>
          <CardTitle className="text-foreground flex items-center gap-2">
            <Plus className="w-5 h-5 text-green-500" />
            Add Test Data to Database
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap items-end gap-4">
            <div className="flex-1 min-w-[200px]">
              <label className="text-sm text-muted-foreground mb-1 block">Email</label>
              <Input 
                placeholder="test@example.com" 
                value={testEmail}
                onChange={(e) => setTestEmail(e.target.value)}
              />
            </div>
            <div className="flex-1 min-w-[200px]">
              <label className="text-sm text-muted-foreground mb-1 block">Name (optional)</label>
              <Input 
                placeholder="Test User" 
                value={testName}
                onChange={(e) => setTestName(e.target.value)}
              />
            </div>
            <Button 
              onClick={handleAddTestWaitlist} 
              disabled={addingTest}
              className="bg-green-600 hover:bg-green-700"
            >
              {addingTest ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Plus className="w-4 h-4 mr-2" />}
              Add to Waitlist
            </Button>
          </div>
          <p className="text-xs text-muted-foreground mt-2">
            This adds a test entry directly to the Supabase database waitlist table.
          </p>
        </CardContent>
      </Card>

      {/* Website Migrated Tables Section */}
      <div>
        <div className="flex items-center gap-2 mb-4">
          <Badge variant="default" className="bg-purple-600 text-white">Website / Platform</Badge>
          <span className="text-sm text-muted-foreground">Website and platform tables in Supabase</span>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          {websiteTables.map((table) => {
            const Icon = table.icon;
            const count = websiteStats[table.value] || 0;
            return (
              <Card 
                key={table.value} 
                className={`bg-card/50 border-purple-500/30 cursor-pointer transition-all hover:border-purple-500 ${selectedTable === table.value ? 'ring-2 ring-purple-500' : ''}`}
                onClick={() => setSelectedTable(table.value)}
              >
                <CardContent className="pt-6">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-purple-500/10">
                      <Icon className="w-5 h-5 text-purple-500" />
                    </div>
                    <div>
                      <p className="text-2xl font-bold text-foreground">{count.toLocaleString()}</p>
                      <p className="text-xs text-muted-foreground">{table.label}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>

      {/* Data Table */}
      <Card className="bg-card/50 border-border/50">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-foreground flex items-center gap-2">
              <Database className="w-5 h-5 text-secondary" />
              Database
              <Badge 
                variant="outline" 
                className={getSelectedTableConfig()?.source === 'app' ? 'border-blue-500 text-blue-500' : 'border-purple-500 text-purple-500'}
              >
                {getSelectedTableConfig()?.source === 'app' ? 'App Database' : 'Website / Platform'}
              </Badge>
            </CardTitle>
            <div className="flex items-center gap-3">
              <Select value={selectedTable} onValueChange={setSelectedTable}>
                <SelectTrigger className="w-[200px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <div className="px-2 py-1 text-xs font-semibold text-blue-500">App Database Tables</div>
                  {appTables.map((table) => (
                    <SelectItem key={table.value} value={table.value}>
                      {table.label}
                    </SelectItem>
                  ))}
                  <div className="px-2 py-1 text-xs font-semibold text-purple-500 mt-2">Website / Platform Tables</div>
                  {websiteTables.map((table) => (
                    <SelectItem key={table.value} value={table.value}>
                      {table.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Button variant="outline" size="sm" onClick={handleRefresh}>
                <RefreshCw className="w-4 h-4 mr-2" />
                Refresh
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {tableLoading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="w-6 h-6 animate-spin text-primary" />
            </div>
          ) : tableData.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <p>No data found in <strong>{selectedTable}</strong></p>
              {getSelectedTableConfig()?.source === 'website' && (
                <p className="text-sm mt-2">This table may not exist yet. Run the migration SQL in your Supabase dashboard.</p>
              )}
            </div>
          ) : (
            <>
              <div className="mb-2 text-sm text-muted-foreground">
                Showing {tableData.length} of {totalCount} records
              </div>
              <div className="rounded-lg border border-border/50 overflow-hidden">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-muted/30">
                      {getTableColumns(tableData).map((col) => (
                        <TableHead key={col} className="text-foreground font-medium">
                          {col.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                        </TableHead>
                      ))}
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {tableData.map((row, idx) => (
                      <TableRow key={idx} className="hover:bg-muted/20">
                        {getTableColumns(tableData).map((col) => (
                          <TableCell key={col} className="text-muted-foreground">
                            {formatCellValue(row[col])}
                          </TableCell>
                        ))}
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
