import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Loader2, User, Calendar, Database, Hash, CheckCircle, XCircle } from 'lucide-react';
import { format } from 'date-fns';
import { toast } from 'sonner';
import { maskEmail } from '@/lib/mask-email';

interface AppUser {
  id: string;
  email: string | null;
  unique_id: string | null;
  subscription_active: boolean;
  created_at: string;
  auth_id: string | null;
}

export default function UsersTab() {
  const [users, setUsers] = useState<AppUser[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const response = await supabase.functions.invoke('external-db-query', {
        body: { table: 'admin_users', limit: 100, offset: 0 },
      });

      if (response.error) {
        throw new Error(response.error.message);
      }

      setUsers(response.data.data || []);
    } catch (error: any) {
      console.error('Error fetching users:', error);
      toast.error('Failed to fetch users from database');
    }
    setLoading(false);
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
          <User className="w-6 h-6 text-primary" />
          User Management
          <Badge variant="outline" className="ml-2 border-purple-500 text-purple-500">
            <Database className="w-3 h-3 mr-1" />
            Database
          </Badge>
        </CardTitle>
        <CardDescription>View and manage all registered users from database ({users.length} total)</CardDescription>
      </CardHeader>
      <CardContent>
        {users.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground">
            No users registered yet.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="border-border/50">
                  <TableHead className="text-muted-foreground">Unique ID</TableHead>
                  <TableHead className="text-muted-foreground">Email</TableHead>
                  <TableHead className="text-muted-foreground">Subscription</TableHead>
                  <TableHead className="text-muted-foreground">Joined</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {users.map((user) => (
                  <TableRow key={user.id} className="border-border/50 hover:bg-muted/30">
                    <TableCell className="font-medium">
                      <div className="flex items-center gap-2">
                        <Hash className="w-4 h-4 text-primary" />
                        {user.unique_id || <span className="text-muted-foreground italic">�</span>}
                      </div>
                    </TableCell>
                    <TableCell>
                      {maskEmail(user.email) || 'No email'}
                    </TableCell>
                    <TableCell>
                      {user.subscription_active ? (
                        <Badge className="bg-green-500/10 text-green-500 border-green-500/30">
                          <CheckCircle className="w-3 h-3 mr-1" />
                          Active
                        </Badge>
                      ) : (
                        <Badge variant="outline" className="text-muted-foreground">
                          <XCircle className="w-3 h-3 mr-1" />
                          Inactive
                        </Badge>
                      )}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Calendar className="w-4 h-4 text-muted-foreground" />
                        {user.created_at ? format(new Date(user.created_at), 'dd/MM/yyyy') : '-'}
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
  );
}
