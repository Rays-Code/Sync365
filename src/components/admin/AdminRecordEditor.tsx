import { useEffect, useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Loader2 } from 'lucide-react';
import type { AdminFieldConfig, AdminTableConfig } from '@/lib/adminTableConfig';
import { adminMutateRecord } from '@/services/supabaseFunctions';

function emptyValues(fields: AdminFieldConfig[]): Record<string, string | boolean> {
  const out: Record<string, string | boolean> = {};
  for (const f of fields) {
    if (f.type === 'boolean') out[f.key] = false;
    else out[f.key] = '';
  }
  return out;
}

function recordToForm(
  record: Record<string, unknown> | null,
  fields: AdminFieldConfig[]
): Record<string, string | boolean> {
  if (!record) return emptyValues(fields);
  const out: Record<string, string | boolean> = {};
  for (const f of fields) {
    const raw = record[f.key];
    if (f.type === 'boolean') {
      out[f.key] = Boolean(raw);
    } else if (raw == null) {
      out[f.key] = '';
    } else {
      out[f.key] = String(raw);
    }
  }
  return out;
}

function formToPayload(
  values: Record<string, string | boolean>,
  fields: AdminFieldConfig[]
): Record<string, unknown> {
  const payload: Record<string, unknown> = {};
  for (const f of fields) {
    const v = values[f.key];
    if (f.type === 'boolean') {
      payload[f.key] = Boolean(v);
      continue;
    }
    const str = String(v ?? '').trim();
    if (f.type === 'number') {
      if (str === '') payload[f.key] = 0;
      else payload[f.key] = Number(str);
      continue;
    }
    if (str === '') {
      payload[f.key] = null;
    } else {
      payload[f.key] = str;
    }
  }
  return payload;
}

interface AdminRecordEditorProps {
  config: AdminTableConfig;
  record: Record<string, unknown> | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSaved: () => void;
}

export function AdminRecordEditor({
  config,
  record,
  open,
  onOpenChange,
  onSaved,
}: AdminRecordEditorProps) {
  const isEdit = Boolean(record);
  const [values, setValues] = useState<Record<string, string | boolean>>(() =>
    recordToForm(record, config.fields)
  );
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (open) {
      setValues(recordToForm(record, config.fields));
      setError(null);
    }
  }, [open, record, config.fields]);

  const setField = (key: string, value: string | boolean) => {
    setValues((prev) => ({ ...prev, [key]: value }));
  };

  const handleSave = async () => {
    for (const f of config.fields) {
      if (f.required && !f.readOnlyOnEdit && String(values[f.key] ?? '').trim() === '') {
        setError(`${f.label} is required`);
        return;
      }
      if (!isEdit && f.required && f.readOnlyOnEdit && String(values[f.key] ?? '').trim() === '') {
        setError(`${f.label} is required`);
        return;
      }
    }

    setSaving(true);
    setError(null);
    try {
      const payload = formToPayload(values, config.fields);
      const idColumn = config.idColumn ?? 'id';
      const recordId = record
        ? String(record[idColumn] ?? record.id ?? '')
        : undefined;

      if (isEdit && recordId) {
        await adminMutateRecord(config.table, 'update', {
          id: recordId,
          idColumn,
          data: payload,
        });
      } else if (config.upsertConflict) {
        await adminMutateRecord(config.table, 'upsert', {
          data: payload,
          onConflict: config.upsertConflict,
        });
      } else {
        await adminMutateRecord(config.table, 'insert', { data: payload });
      }
      onSaved();
      onOpenChange(false);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Save failed');
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {isEdit ? 'Edit' : 'Add'} {config.label}
          </DialogTitle>
          <DialogDescription>
            Changes apply immediately for users in that region or plan.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-2">
          {config.fields.map((field) => {
            const disabled = isEdit && field.readOnlyOnEdit;
            if (field.type === 'boolean') {
              return (
                <div key={field.key} className="flex items-center justify-between gap-4">
                  <Label htmlFor={field.key}>{field.label}</Label>
                  <Switch
                    id={field.key}
                    checked={Boolean(values[field.key])}
                    onCheckedChange={(checked) => setField(field.key, checked)}
                  />
                </div>
              );
            }
            if (field.type === 'select' && field.options) {
              return (
                <div key={field.key} className="space-y-2">
                  <Label htmlFor={field.key}>{field.label}</Label>
                  <Select
                    value={String(values[field.key] ?? '')}
                    onValueChange={(v) => setField(field.key, v)}
                    disabled={disabled}
                  >
                    <SelectTrigger id={field.key}>
                      <SelectValue placeholder="Select�" />
                    </SelectTrigger>
                    <SelectContent>
                      {field.options.map((opt) => (
                        <SelectItem key={opt.value} value={opt.value}>
                          {opt.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              );
            }
            return (
              <div key={field.key} className="space-y-2">
                <Label htmlFor={field.key}>{field.label}</Label>
                <Input
                  id={field.key}
                  type={field.type === 'number' ? 'number' : 'text'}
                  step={field.type === 'number' ? '0.01' : undefined}
                  placeholder={field.placeholder}
                  value={String(values[field.key] ?? '')}
                  onChange={(e) => setField(field.key, e.target.value)}
                  disabled={disabled}
                />
              </div>
            );
          })}
          {error && <p className="text-sm text-destructive">{error}</p>}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={saving}>
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={saving}>
            {saving && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
            Save
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
