import { Globe } from 'lucide-react';
import { useCountry } from '@/contexts/CountryContext';
import {
  COUNTRY_FEATURE_LABELS,
  type CountryFeatureKey,
} from '@/lib/countryFeatures';

interface RegionUnavailableProps {
  feature?: CountryFeatureKey;
  className?: string;
  compact?: boolean;
}

export default function RegionUnavailable({
  feature,
  className = '',
  compact = false,
}: RegionUnavailableProps) {
  const { country, blockMessage, isCountryAllowed } = useCountry();

  const featureLabel = feature ? COUNTRY_FEATURE_LABELS[feature] : null;
  const message = !isCountryAllowed
    ? blockMessage
    : featureLabel
      ? `${featureLabel} is not available in your region${country ? ` (${country})` : ''}.`
      : 'This feature is not available in your region.';

  if (compact) {
    return (
      <p className={`text-sm text-muted-foreground ${className}`}>{message}</p>
    );
  }

  return (
    <div
      className={`glass rounded-2xl border border-border/50 p-6 text-center ${className}`}
    >
      <Globe className="w-10 h-10 text-muted-foreground mx-auto mb-3" />
      <p className="text-foreground font-medium mb-1">Not available in your region</p>
      <p className="text-sm text-muted-foreground">{message}</p>
    </div>
  );
}
