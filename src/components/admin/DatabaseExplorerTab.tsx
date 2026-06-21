import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Loader2, Database, Plus, Pencil, Trash2 } from 'lucide-react';
import { toast } from 'sonner';

import { 
  adminQueryTable, 
  adminMutateRecord 
} from '@/services/supabaseFunctions';
import { AdminRecordEditor } from './AdminRecordEditor';
import { getEditableTableConfig, ADMIN_EDITABLE_TABLES } from '@/lib/adminTableConfig';

export default function DatabaseExplorerTab() {
  const [activeTable, setActiveTable] = useState('waitlist');
  const [tableData, setTableData] = useState<any[]>([]);
  const [loadingTable, setLoadingTable] = useState(false);
  const [editorOpen, setEditorOpen] = useState(false);
  const [editingRecord, setEditingRecord] = useState<Record<string, unknown> | null>(null);

  useEffect(() => {
    fetchTableData(activeTable);
  }, [activeTable]);

  const fetchTableData = async (tableName: string) => {
    try {
      setLoadingTable(true);
      const res = await adminQueryTable(tableName, 50, 0);
      setTableData(res?.data || []);
    } catch (err: any) {
      console.error(err);
      toast.error(`Failed to load table: ${tableName}`);
      setTableData([]);
    } finally {
      setLoadingTable(false);
    }
  };

  const editableConfig = getEditableTableConfig(activeTable);

  const openCreate = () => {
    setEditingRecord(null);
    setEditorOpen(true);
  };

  const openEdit = (row: Record<string, unknown>) => {
    setEditingRecord(row);
    setEditorOpen(true);
  };

  const handleDeleteRow = async (row: Record<string, unknown>) => {
    if (!editableConfig) return;
    const idColumn = editableConfig.idColumn ?? 'id';
    const recordId = row[idColumn] ?? row.id;
    if (!recordId) {
      toast.error('Cannot delete: missing row id');
      return;
    }
    if (!window.confirm(`Delete this ${editableConfig.label.toLowerCase()}?`)) return;
    try {
      await adminMutateRecord(editableConfig.table, 'delete', {
        id: String(recordId),
        idColumn,
      });
      toast.success('Deleted');
      fetchTableData(activeTable);
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Delete failed');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4 mb-4">
        <Database className="w-6 h-6 text-primary" />
        <h2 className="text-2xl font-semibold font-heading text-foreground">Database Explorer</h2>
      </div>

      <div className="flex gap-2 mb-4 overflow-x-auto pb-2 scrollbar-thin">
        {['waitlist', 'profiles', 'subscriptions', 'orders', 'transactions', 'refund_requests', 'site_visits', 'security_events', 'app_settings', 'pricing_plans', 'country_pricing', 'country_access', 'country_feature_flags'].map(tbl => (
          <Button 
            key={tbl}
            variant={activeTable === tbl ? "default" : "outline"}
            onClick={() => setActiveTable(tbl)}
            className="rounded-full capitalize whitespace-nowrap h-8 text-xs border-border/50"
          >
            {tbl.replace(/_/g, ' ')}
            {ADMIN_EDITABLE_TABLES[tbl] && (
              <span className="ml-1 text-[9px] opacity-80 bg-primary/20 text-primary px-1.5 py-0.5 rounded-full">edit</span>
            )}
          </Button>
        ))}
      </div>

      {editableConfig && (
        <div className="flex flex-wrap items-center justify-between gap-3 mb-3">
          <p className="text-xs text-muted-foreground">
            Edit regional prices, Stripe price IDs, plan amounts, and country flags.
          </p>
          <Button size="sm" onClick={openCreate} className="h-8 text-xs">
            <Plus className="w-3.5 h-3.5 mr-1" />
            Add {editableConfig.label}
          </Button>
        </div>
      )}

      <Card className="glass border-border/50">
        <CardContent className="p-0 overflow-x-auto">
          {loadingTable ? (
            <div className="flex justify-center py-12">
              <Loader2 className="w-6 h-6 animate-spin text-primary" />
            </div>
          ) : tableData.length === 0 ? (
            <div className="text-center py-12 text-sm text-muted-foreground">No data found in {activeTable}</div>
          ) : (
            <table className="w-full text-xs text-left border-collapse">
              <thead className="text-[11px] uppercase bg-muted/40 text-muted-foreground border-b border-border/40">
                <tr>
                  {editableConfig && <th className="px-4 py-3 w-[80px]">Actions</th>}
                  {Object.keys(tableData[0]).map(key => (
                    <th key={key} className="px-4 py-3 font-semibold">{key.replace(/_/g, ' ')}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-border/20">
                {tableData.map((row, i) => (
                  <tr key={i} className="hover:bg-muted/10">
                    {editableConfig && (
                      <td className="px-4 py-2">
                        <div className="flex gap-0.5">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-7 w-7 text-muted-foreground hover:text-foreground"
                            title="Edit"
                            onClick={() => openEdit(row)}
                          >
                            <Pencil className="w-3.5 h-3.5" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-7 w-7 text-destructive hover:text-destructive"
                            title="Delete"
                            onClick={() => handleDeleteRow(row)}
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </Button>
                        </div>
                      </td>
                    )}
                    {Object.values(row).map((val: unknown, j) => (
                      <td 
                        key={j} 
                        className="px-4 py-2 max-w-[200px] truncate text-muted-foreground" 
                        title={typeof val === 'object' ? JSON.stringify(val) : String(val ?? '')}
                      >
                        {typeof val === 'object' ? JSON.stringify(val) : String(val ?? '')}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </CardContent>
      </Card>

      {editableConfig && (
        <AdminRecordEditor
          config={editableConfig}
          record={editingRecord}
          open={editorOpen}
          onOpenChange={setEditorOpen}
          onSaved={() => {
            toast.success(editingRecord ? 'Updated' : 'Created');
            fetchTableData(activeTable);
          }}
        />
      )}
    </div>
  );
}
