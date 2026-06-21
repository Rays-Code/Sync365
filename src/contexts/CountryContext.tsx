import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useDetectCountry } from '@/hooks/useDetectCountry';
import {
  type CountryAccessRow,
  type CountryFeatureFlagRow,
  type CountryFeatureKey,
  resolveCountryAllowed,
  resolveFeatureEnabled,
} from '@/lib/countryFeatures';

interface CountryContextValue {
  country: string | null;
  countryLoading: boolean;
  flagsLoading: boolean;
  loading: boolean;
  countryAccess: CountryAccessRow | null;
  featureFlags: CountryFeatureFlagRow[];
  isCountryAllowed: boolean;
  blockMessage: string | null;
  isFeatureEnabled: (feature: CountryFeatureKey) => boolean;
}

const CountryContext = createContext<CountryContextValue | null>(null);

export function CountryProvider({ children }: { children: ReactNode }) {
  const { country, loading: countryLoading } = useDetectCountry();
  const [countryAccess, setCountryAccess] = useState<CountryAccessRow | null>(null);
  const [featureFlags, setFeatureFlags] = useState<CountryFeatureFlagRow[]>([]);
  const [flagsLoading, setFlagsLoading] = useState(true);

  useEffect(() => {
    if (!country) {
      setCountryAccess(null);
      setFeatureFlags([]);
      setFlagsLoading(false);
      return;
    }

    const code = country.toUpperCase();
    let cancelled = false;

    async function load() {
      setFlagsLoading(true);
      try {
        const [accessRes, flagsRes] = await Promise.all([
          supabase
            .from('country_access')
            .select('country_code, country_name, is_allowed, block_message')
            .eq('country_code', code)
            .maybeSingle(),
          supabase
            .from('country_feature_flags')
            .select('id, country_code, feature_key, enabled')
            .eq('country_code', code),
        ]);

        if (cancelled) return;
        setCountryAccess(accessRes.data as CountryAccessRow | null);
        setFeatureFlags((flagsRes.data as CountryFeatureFlagRow[]) || []);
      } catch (err) {
        console.error('[CountryProvider] Failed to load country rules:', err);
        if (!cancelled) {
          setCountryAccess(null);
          setFeatureFlags([]);
        }
      } finally {
        if (!cancelled) setFlagsLoading(false);
      }
    }

    load();
    return () => {
      cancelled = true;
    };
  }, [country]);

  const isCountryAllowed = useMemo(
    () => resolveCountryAllowed(country, countryAccess),
    [country, countryAccess]
  );

  const blockMessage = useMemo(() => {
    if (!country || isCountryAllowed) return null;
    return (
      countryAccess?.block_message ||
      'This service is not available in your region yet.'
    );
  }, [country, isCountryAllowed, countryAccess]);

  const isFeatureEnabled = useCallback(
    (feature: CountryFeatureKey) =>
      resolveFeatureEnabled(feature, country, countryAccess, featureFlags),
    [country, countryAccess, featureFlags]
  );

  const loading = countryLoading || flagsLoading;

  const value = useMemo(
    () => ({
      country,
      countryLoading,
      flagsLoading,
      loading,
      countryAccess,
      featureFlags,
      isCountryAllowed,
      blockMessage,
      isFeatureEnabled,
    }),
    [
      country,
      countryLoading,
      flagsLoading,
      loading,
      countryAccess,
      featureFlags,
      isCountryAllowed,
      blockMessage,
      isFeatureEnabled,
    ]
  );

  return (
    <CountryContext.Provider value={value}>{children}</CountryContext.Provider>
  );
}

export function useCountry() {
  const ctx = useContext(CountryContext);
  if (!ctx) {
    throw new Error('useCountry must be used within CountryProvider');
  }
  return ctx;
}
