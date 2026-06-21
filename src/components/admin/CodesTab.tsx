import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Loader2, Ticket, Search, Plus, Database, Download, BarChart3 } from 'lucide-react';
import { format } from 'date-fns';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { maskEmail } from '@/lib/mask-email';

interface RedemptionCode {
  id: string;
  code: string;
  product_type: string;
  product_name: string;
  created_for_email: string | null;
  status: 'available' | 'redeemed' | 'expired';
  redeemed_by_email: string | null;
  redeemed_at: string | null;
  expires_at: string | null;
  created_at: string;
}

export default function CodesTab() {
  const [codes, setCodes] = useState<RedemptionCode[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [bulkDialogOpen, setBulkDialogOpen] = useState(false);
  const [bulkCount, setBulkCount] = useState(10);
  const [bulkProductType, setBulkProductType] = useState('supermoon');
  const [bulkGenerating, setBulkGenerating] = useState(false);
  const [bulkCreatedFor, setBulkCreatedFor] = useState('');
  const [bulkCreatedForType, setBulkCreatedForType] = useState<'business' | 'member' | 'email'>('business');
  const [bulkExpiryEnabled, setBulkExpiryEnabled] = useState(false);
  const [bulkExpiryDays, setBulkExpiryDays] = useState(365);
  const [duplicateWarning, setDuplicateWarning] = useState<string | null>(null);
  const [bypassDuplicate, setBypassDuplicate] = useState(false);
  const [newCode, setNewCode] = useState({
    product_type: 'supermoon',
    product_name: 'Premium Annual',
    created_for: '',
    created_for_type: 'business' as 'business' | 'member' | 'email',
    duration_months: 12,
    expiry_enabled: false,
    expiry_days: 365,
  });

  // Mapping for display: database values ? UI labels
  const productDisplayNames: Record<string, string> = {
    supermoon: 'Premium Annual',
    full_moon: 'Premium Monthly',
    starter: 'Free',
  };
  const { toast } = useToast();

  const checkDuplicateEmail = (email: string): boolean => {
    if (!email || !email.includes('@')) return false;
    return codes.some(c => c.created_for_email?.toLowerCase() === email.toLowerCase());
  };

  useEffect(() => {
    fetchCodes();
  }, []);

  const fetchCodes = async () => {
    setLoading(true);
    try {
      const { data: sessionData } = await supabase.auth.getSession();
      
      const response = await supabase.functions.invoke('external-db-query', {
        body: { table: 'redemption_codes', limit: 200, offset: 0 },
        headers: sessionData.session ? {
          Authorization: `Bearer ${sessionData.session.access_token}`,
        } : {},
      });

      if (response.error) {
        throw new Error(response.error.message);
      }

      setCodes(response.data.data || []);
    } catch (error: any) {
      console.error('Error fetching codes:', error);
      toast({
        title: 'Error',
        description: 'Failed to fetch codes from database',
        variant: 'destructive',
      });
    }
    setLoading(false);
  };

  const generateCodeString = (productType: string, businessName?: string, serialNumber?: number) => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let randomPart = '';
    for (let i = 0; i < 4; i++) {
      randomPart += chars.charAt(Math.floor(Math.random() * chars.length));
    }

    // For bulk with business name: TIER-BIZABBREV-001-XXXX
    if (businessName && serialNumber !== undefined) {
      const abbrev = businessName
        .replace(/[^a-zA-Z0-9\s]/g, '')
        .split(/\s+/)
        .map(w => w.slice(0, 3).toUpperCase())
        .join('')
        .slice(0, 8);
      const serial = String(serialNumber).padStart(3, '0');
      return `${productType.toUpperCase()}-${abbrev}-${serial}-${randomPart}`;
    }

    return `${productType.toUpperCase()}-${randomPart}${chars.charAt(Math.floor(Math.random() * chars.length))}${chars.charAt(Math.floor(Math.random() * chars.length))}${chars.charAt(Math.floor(Math.random() * chars.length))}${chars.charAt(Math.floor(Math.random() * chars.length))}`;
  };

  const handleBulkGenerate = async () => {
    setBulkGenerating(true);
    const { data: sessionData } = await supabase.auth.getSession();
    const authHeaders = sessionData.session ? {
      Authorization: `Bearer ${sessionData.session.access_token}`,
    } : {};

    const productConfig: Record<string, string> = {
      supermoon: 'Premium Annual',
      full_moon: 'Premium Monthly',
      starter: 'Free',
    };

    const generatedCodes: string[] = [];
    let failCount = 0;

    const expiresAt = bulkExpiryEnabled
      ? new Date(Date.now() + bulkExpiryDays * 24 * 60 * 60 * 1000).toISOString()
      : null;

    for (let i = 0; i < bulkCount; i++) {
      const code = bulkCreatedForType === 'business' && bulkCreatedFor
        ? generateCodeString(bulkProductType, bulkCreatedFor, i + 1)
        : generateCodeString(bulkProductType);
      generatedCodes.push(code);
      const response = await supabase.functions.invoke('external-db-mutate', {
        body: {
          table: 'redemption_codes',
          operation: 'insert',
          data: {
            code,
            product_type: bulkProductType,
            product_name: productConfig[bulkProductType],
            status: 'available',
            created_for_email: bulkCreatedFor || null,
            expires_at: expiresAt,
          }
        },
        headers: authHeaders,
      });

      if (response.error) failCount++;
    }

    setBulkGenerating(false);
    setBulkDialogOpen(false);
    setBulkCreatedFor('');
    setBulkExpiryEnabled(false);
    setBulkExpiryDays(365);

    if (failCount === 0) {
      toast({
        title: `${bulkCount} codes generated`,
        description: `All ${bulkCount} ${productConfig[bulkProductType]} codes created successfully.`,
      });
    } else {
      toast({
        title: 'Partial success',
        description: `${bulkCount - failCount} of ${bulkCount} codes created. ${failCount} failed.`,
        variant: 'destructive',
      });
    }

    fetchCodes();
  };

  const exportToCSV = () => {
    const dataToExport = filteredCodes.length > 0 ? filteredCodes : codes;
    if (dataToExport.length === 0) {
      toast({ title: 'No data', description: 'No codes to export.', variant: 'destructive' });
      return;
    }

    const headers = ['Code', 'Product Type', 'Product Name', 'Status', 'Created For', 'Redeemed By', 'Redeemed At', 'Created At', 'Expires At'];
    const rows = dataToExport.map(c => [
      c.code,
      c.product_type,
      c.product_name,
      c.status,
      c.created_for_email || '',
      c.redeemed_by_email || '',
      c.redeemed_at ? format(new Date(c.redeemed_at), 'yyyy-MM-dd') : '',
      c.created_at ? format(new Date(c.created_at), 'yyyy-MM-dd') : '',
      c.expires_at ? format(new Date(c.expires_at), 'yyyy-MM-dd') : '',
    ]);

    const csv = [headers.join(','), ...rows.map(r => r.map(v => `"${v}"`).join(','))].join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `redemption-codes-${format(new Date(), 'yyyy-MM-dd')}.csv`;
    a.click();
    URL.revokeObjectURL(url);

    toast({ title: 'Exported', description: `${dataToExport.length} codes exported to CSV.` });
  };

  const handleCreateCode = async () => {
    // Duplicate email check
    if (newCode.created_for_type === 'email' && newCode.created_for) {
      const isDuplicate = checkDuplicateEmail(newCode.created_for);
      if (isDuplicate && !bypassDuplicate) {
        setDuplicateWarning(`Email "${newCode.created_for}" already has a code assigned. Check the bypass box to proceed anyway.`);
        return;
      }
    }

    const code = generateCodeString(newCode.product_type);
    const { data: sessionData } = await supabase.auth.getSession();
    const authHeaders = sessionData.session ? {
      Authorization: `Bearer ${sessionData.session.access_token}`,
    } : {};
    
    const expiresAt = newCode.expiry_enabled
      ? new Date(Date.now() + newCode.expiry_days * 24 * 60 * 60 * 1000).toISOString()
      : null;
    
    const response = await supabase.functions.invoke('external-db-mutate', {
      body: {
        table: 'redemption_codes',
        operation: 'insert',
        data: {
          code,
          product_type: newCode.product_type,
          product_name: newCode.product_name,
          created_for_email: newCode.created_for || null,
          status: 'available',
          expires_at: expiresAt,
        }
      },
      headers: authHeaders,
    });

    if (response.error) {
      toast({
        title: 'Failed to create code',
        description: response.error.message,
        variant: 'destructive',
      });
    } else {
      toast({
        title: 'Code created',
        description: `Code ${code} has been created.`,
      });
      setDialogOpen(false);
      setDuplicateWarning(null);
      setBypassDuplicate(false);
      setNewCode({ product_type: 'supermoon', product_name: 'Premium Annual', created_for: '', created_for_type: 'business', duration_months: 12, expiry_enabled: false, expiry_days: 365 });
      fetchCodes();
    }
  };

  const filteredCodes = codes.filter((code) => {
    const matchesSearch = 
      code.code?.toLowerCase().includes(search.toLowerCase()) ||
      (code.created_for_email?.toLowerCase().includes(search.toLowerCase()) ?? false) ||
      code.product_name?.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = statusFilter === 'all' || code.status === statusFilter;
    return matchesSearch && matchesStatus;
  });
  // Compute bulk batch statistics grouped by business/created_for
  const batchStats = (() => {
    const businessCodes = codes.filter(c => c.created_for_email && !c.created_for_email.includes('@'));
    const grouped: Record<string, { total: number; redeemed: number; available: number; expired: number; firstCreated: string }> = {};
    businessCodes.forEach(c => {
      const key = c.created_for_email!;
      if (!grouped[key]) {
        grouped[key] = { total: 0, redeemed: 0, available: 0, expired: 0, firstCreated: c.created_at };
      }
      grouped[key].total++;
      grouped[key][c.status]++;
      if (c.created_at < grouped[key].firstCreated) grouped[key].firstCreated = c.created_at;
    });
    return Object.entries(grouped)
      .map(([name, stats]) => ({ name, ...stats }))
      .sort((a, b) => b.total - a.total);
  })();

  const getStatusBadge = (status: RedemptionCode['status']) => {
    const styles: Record<RedemptionCode['status'], string> = {
      available: 'bg-accent/20 text-accent',
      redeemed: 'bg-primary/20 text-primary',
      expired: 'bg-muted text-muted-foreground',
    };
    return <Badge className={styles[status]}>{status === 'redeemed' ? 'Redeemed' : status === 'available' ? 'Available' : 'Expired'}</Badge>;
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
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle className="font-heading text-2xl flex items-center gap-2">
            <Ticket className="w-6 h-6 text-primary" />
            Redemption Codes
            <Badge variant="outline" className="ml-2 border-purple-500 text-purple-500">
              <Database className="w-3 h-3 mr-1" />
              Database
            </Badge>
          </CardTitle>
          <CardDescription>View and manage redemption codes</CardDescription>
        </div>
        <div className="flex gap-2 flex-wrap">
          <Button variant="outline" onClick={exportToCSV}>
            <Download className="w-4 h-4 mr-2" />
            Export CSV
          </Button>
          
          <Dialog open={bulkDialogOpen} onOpenChange={setBulkDialogOpen}>
            <DialogTrigger asChild>
              <Button variant="outline">
                <Plus className="w-4 h-4 mr-2" />
                Bulk Generate
              </Button>
            </DialogTrigger>
            <DialogContent className="glass border-border/50">
              <DialogHeader>
                <DialogTitle className="font-heading">Bulk Generate Codes</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 mt-4">
                <div className="space-y-2">
                  <Label>Product Tier</Label>
                  <Select value={bulkProductType} onValueChange={setBulkProductType}>
                    <SelectTrigger className="bg-muted/50 border-border">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="full_moon">Premium Monthly</SelectItem>
                      <SelectItem value="supermoon">Premium Annual (1 Year)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Number of Codes</Label>
                  <Input
                    type="number"
                    min={1}
                    max={100}
                    value={bulkCount}
                    onChange={(e) => setBulkCount(Math.min(100, Math.max(1, parseInt(e.target.value) || 1)))}
                    className="bg-muted/50 border-border"
                  />
                  <p className="text-xs text-muted-foreground">Max 100 codes per batch</p>
                </div>
                <div className="space-y-2">
                  <Label>Created For</Label>
                  <Select value={bulkCreatedForType} onValueChange={(v: 'business' | 'member' | 'email') => setBulkCreatedForType(v)}>
                    <SelectTrigger className="bg-muted/50 border-border">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="business">Business / Corporate Name</SelectItem>
                      <SelectItem value="member">Member Number (Existing User)</SelectItem>
                      <SelectItem value="email">Email (New User)</SelectItem>
                    </SelectContent>
                  </Select>
                  <Input
                    placeholder={bulkCreatedForType === 'business' ? 'e.g. WellnessCorp Pty Ltd' : bulkCreatedForType === 'member' ? 'e.g. 1234567' : 'user@email.com'}
                    value={bulkCreatedFor}
                    onChange={(e) => setBulkCreatedFor(e.target.value)}
                    className="bg-muted/50 border-border"
                  />
                </div>
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      id="bulk-expiry"
                      checked={bulkExpiryEnabled}
                      onChange={(e) => setBulkExpiryEnabled(e.target.checked)}
                      className="rounded border-border"
                    />
                    <Label htmlFor="bulk-expiry">Set Expiry Date</Label>
                  </div>
                  {bulkExpiryEnabled && (
                    <div className="space-y-1">
                      <Label className="text-xs text-muted-foreground">Expires in (days)</Label>
                      <Input
                        type="number"
                        min={1}
                        max={3650}
                        value={bulkExpiryDays}
                        onChange={(e) => setBulkExpiryDays(Math.min(3650, Math.max(1, parseInt(e.target.value) || 365)))}
                        className="bg-muted/50 border-border"
                      />
                    </div>
                  )}
                </div>
                <Button onClick={handleBulkGenerate} disabled={bulkGenerating} className="w-full btn-cosmic text-primary-foreground">
                  {bulkGenerating ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Generating...
                    </>
                  ) : (
                    `Generate ${bulkCount} Codes`
                  )}
                </Button>
              </div>
            </DialogContent>
          </Dialog>

          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button className="btn-cosmic text-primary-foreground">
                <Plus className="w-4 h-4 mr-2" />
                Create Code
              </Button>
            </DialogTrigger>
            <DialogContent className="glass border-border/50">
              <DialogHeader>
                <DialogTitle className="font-heading">Create Redemption Code</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 mt-4">
                <div className="space-y-2">
                  <Label>Product Tier</Label>
                  <Select 
                    value={newCode.product_type} 
                    onValueChange={(value) => {
                      const config: Record<string, { name: string; duration: number }> = {
                        starter: { name: 'Free', duration: 0 },
                        full_moon: { name: 'Premium Monthly', duration: 1 },
                        supermoon: { name: 'Premium Annual', duration: 12 },
                      };
                      setNewCode({ 
                        ...newCode, 
                        product_type: value, 
                        product_name: config[value].name,
                        duration_months: config[value].duration 
                      });
                    }}
                  >
                    <SelectTrigger className="bg-muted/50 border-border">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="starter">Free (No premium features)</SelectItem>
                      <SelectItem value="full_moon">Premium Monthly</SelectItem>
                      <SelectItem value="supermoon">Premium Annual (1 Year)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Created For</Label>
                  <Select value={newCode.created_for_type} onValueChange={(v: 'business' | 'member' | 'email') => setNewCode({ ...newCode, created_for_type: v, created_for: '' })}>
                    <SelectTrigger className="bg-muted/50 border-border">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="business">Business / Corporate Name</SelectItem>
                      <SelectItem value="member">Member Number (Existing User)</SelectItem>
                      <SelectItem value="email">Email (New User)</SelectItem>
                    </SelectContent>
                  </Select>
                  <Input
                    placeholder={newCode.created_for_type === 'business' ? 'e.g. WellnessCorp Pty Ltd' : newCode.created_for_type === 'member' ? 'e.g. 1234567' : 'user@email.com'}
                    value={newCode.created_for}
                    onChange={(e) => {
                      setNewCode({ ...newCode, created_for: e.target.value });
                      setDuplicateWarning(null);
                      setBypassDuplicate(false);
                    }}
                    className="bg-muted/50 border-border"
                  />
                  {duplicateWarning && newCode.created_for_type === 'email' && (
                    <div className="rounded-md border border-destructive/50 bg-destructive/10 p-3 space-y-2">
                      <p className="text-xs text-destructive">{duplicateWarning}</p>
                      <div className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          id="bypass-duplicate"
                          checked={bypassDuplicate}
                          onChange={(e) => setBypassDuplicate(e.target.checked)}
                          className="rounded border-border"
                        />
                        <Label htmlFor="bypass-duplicate" className="text-xs">Bypass duplicate check</Label>
                      </div>
                    </div>
                  )}
                </div>
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      id="single-expiry"
                      checked={newCode.expiry_enabled}
                      onChange={(e) => setNewCode({ ...newCode, expiry_enabled: e.target.checked })}
                      className="rounded border-border"
                    />
                    <Label htmlFor="single-expiry">Set Expiry Date</Label>
                  </div>
                  {newCode.expiry_enabled && (
                    <div className="space-y-1">
                      <Label className="text-xs text-muted-foreground">Expires in (days)</Label>
                      <Input
                        type="number"
                        min={1}
                        max={3650}
                        value={newCode.expiry_days}
                        onChange={(e) => setNewCode({ ...newCode, expiry_days: Math.min(3650, Math.max(1, parseInt(e.target.value) || 365)) })}
                        className="bg-muted/50 border-border"
                      />
                    </div>
                  )}
                </div>
                <Button onClick={handleCreateCode} className="w-full btn-cosmic text-primary-foreground">
                  Generate Code
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search by code, user email, or product..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10 bg-muted/50 border-border"
            />
          </div>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-[150px] bg-muted/50 border-border">
              <SelectValue placeholder="All Codes" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Codes</SelectItem>
              <SelectItem value="available">Available</SelectItem>
              <SelectItem value="redeemed">Redeemed</SelectItem>
              <SelectItem value="expired">Expired</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Bulk Batch History */}
        {batchStats.length > 0 && (
          <div className="rounded-xl border border-border/50 bg-muted/20 p-4">
            <div className="flex items-center gap-2 mb-3">
              <BarChart3 className="w-4 h-4 text-primary" />
              <h4 className="text-sm font-semibold text-foreground">Bulk Order History</h4>
              <Badge variant="outline" className="ml-auto text-xs">{batchStats.length} businesses</Badge>
            </div>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="border-border/30">
                    <TableHead className="text-muted-foreground text-xs">Business / Partner</TableHead>
                    <TableHead className="text-muted-foreground text-xs text-center">Total Codes</TableHead>
                    <TableHead className="text-muted-foreground text-xs text-center">Redeemed</TableHead>
                    <TableHead className="text-muted-foreground text-xs text-center">Available</TableHead>
                    <TableHead className="text-muted-foreground text-xs text-center">Expired</TableHead>
                    <TableHead className="text-muted-foreground text-xs">First Batch</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {batchStats.map((batch) => (
                    <TableRow key={batch.name} className="border-border/30 hover:bg-muted/30">
                      <TableCell className="font-medium text-sm">{batch.name}</TableCell>
                      <TableCell className="text-center text-sm">{batch.total}</TableCell>
                      <TableCell className="text-center text-sm text-primary">{batch.redeemed}</TableCell>
                      <TableCell className="text-center text-sm text-accent">{batch.available}</TableCell>
                      <TableCell className="text-center text-sm text-muted-foreground">{batch.expired}</TableCell>
                      <TableCell className="text-sm text-muted-foreground">{format(new Date(batch.firstCreated), 'dd/MM/yyyy')}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </div>
        )}

        {filteredCodes.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground">
            No codes found.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="border-border/50">
                  <TableHead className="text-muted-foreground">Code</TableHead>
                  <TableHead className="text-muted-foreground">Product</TableHead>
                  <TableHead className="text-muted-foreground">Created For</TableHead>
                  <TableHead className="text-muted-foreground">Status</TableHead>
                  <TableHead className="text-muted-foreground">Redeemed By</TableHead>
                  <TableHead className="text-muted-foreground">Created</TableHead>
                  <TableHead className="text-muted-foreground">Expires</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredCodes.map((code) => (
                  <TableRow key={code.id} className="border-border/50 hover:bg-muted/30">
                    <TableCell className="font-mono font-medium">{code.code}</TableCell>
                    <TableCell>
                      <div>
                        <div className="font-medium">{productDisplayNames[code.product_type] || code.product_name}</div>
                        <div className="text-xs text-muted-foreground capitalize">{code.product_type.replace('_', ' ')}</div>
                      </div>
                    </TableCell>
                    <TableCell>{code.created_for_email ? (code.created_for_email.includes('@') ? maskEmail(code.created_for_email) : code.created_for_email) : '-'}</TableCell>
                    <TableCell>{getStatusBadge(code.status)}</TableCell>
                    <TableCell>
                      {code.redeemed_by_email ? (
                        <div>
                          <div>{maskEmail(code.redeemed_by_email)}</div>
                          {code.redeemed_at && (
                            <div className="text-xs text-muted-foreground">
                              {format(new Date(code.redeemed_at), 'dd/MM/yyyy')}
                            </div>
                          )}
                        </div>
                      ) : '-'}
                    </TableCell>
                    <TableCell>{code.created_at ? format(new Date(code.created_at), 'dd/MM/yyyy') : '-'}</TableCell>
                    <TableCell>{code.expires_at ? format(new Date(code.expires_at), 'dd/MM/yyyy') : 'No expiry'}</TableCell>
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
