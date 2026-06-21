import { useState, useEffect } from 'react';
import { userDetectCountry } from '@/services/supabaseFunctions';

export function useDetectCountry() {
  const [country, setCountry] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Allow override via ?country=XX query param (for testing/troubleshooting)
    const params = new URLSearchParams(window.location.search);
    const override = params.get('country');
    if (override) {
      console.log(`[useDetectCountry] Using override country: ${override.toUpperCase()}`);
      setCountry(override.toUpperCase());
      setLoading(false);
      return;
    }

    userDetectCountry()
      .then((res) => {
        if (res?.country) setCountry(res.country);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  return { country, loading };
}
