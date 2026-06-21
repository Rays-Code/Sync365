import type { ReactNode } from 'react';
import { useCountry } from '@/contexts/CountryContext';
import type { CountryFeatureKey } from '@/lib/countryFeatures';
import RegionUnavailable from '@/components/RegionUnavailable';

interface FeatureGateProps {
  feature: CountryFeatureKey;
  children: ReactNode;
  /** Shown when feature is disabled; defaults to hidden. */
  fallback?: ReactNode;
  /** When true, show a region message instead of fallback/null. */
  showUnavailable?: boolean;
  className?: string;
}

export default function FeatureGate({
  feature,
  children,
  fallback = null,
  showUnavailable = false,
  className,
}: FeatureGateProps) {
  const { loading, isFeatureEnabled, isCountryAllowed } = useCountry();

  if (loading) return null;

  if (!isCountryAllowed || !isFeatureEnabled(feature)) {
    if (showUnavailable) {
      return <RegionUnavailable feature={feature} className={className} />;
    }
    return <>{fallback}</>;
  }

  return <>{children}</>;
}
