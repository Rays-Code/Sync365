import { useState, useEffect } from 'react';
import { invokeEdgeFunction } from '@/services/supabaseFunctions';

interface UseUniqueIdOptions {
  authId?: string;
  email?: string | null;
}

export function useUniqueId({ authId, email }: UseUniqueIdOptions) {
  const [uniqueId, setUniqueId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!authId) return;

    setLoading(true);
    invokeEdgeFunction('lookup-unique-id', { authId, email })
      .then((res: any) => {
        if (res?.unique_id) setUniqueId(res.unique_id);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [authId, email]);

  return { uniqueId, loading };
}
