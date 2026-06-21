/** Feature keys for per-country gating (must match admin / DB rows). */
export const COUNTRY_FEATURES = {
  PARTNER_SHARING: 'partner_sharing',
  AI_INSIGHTS: 'ai_insights',
  SUBSCRIPTION_CHECKOUT: 'subscription_checkout',
  CODE_REDEMPTION: 'code_redemption',
  REFUND_REQUESTS: 'refund_requests',
  CORPORATE: 'corporate',
} as const;

export type CountryFeatureKey = (typeof COUNTRY_FEATURES)[keyof typeof COUNTRY_FEATURES];

export const COUNTRY_FEATURE_LABELS: Record<CountryFeatureKey, string> = {
  partner_sharing: 'Partner sharing',
  ai_insights: 'AI insights & predictions',
  subscription_checkout: 'Subscription checkout',
  code_redemption: 'Code redemption',
  refund_requests: 'Refund requests',
  corporate: 'Corporate partnerships',
};

export interface CountryAccessRow {
  country_code: string;
  country_name: string;
  is_allowed: boolean;
  block_message: string | null;
}

export interface CountryFeatureFlagRow {
  id: string;
  country_code: string;
  feature_key: string;
  enabled: boolean;
}

/** Default when no DB row exists: feature enabled, country allowed. */
export function resolveFeatureEnabled(
  featureKey: CountryFeatureKey,
  countryCode: string | null,
  access: CountryAccessRow | null,
  flags: CountryFeatureFlagRow[]
): boolean {
  if (!countryCode) return true;
  if (access && !access.is_allowed) return false;
  const flag = flags.find(
    (f) =>
      f.country_code.toUpperCase() === countryCode.toUpperCase() &&
      f.feature_key === featureKey
  );
  return flag ? flag.enabled : true;
}

export function resolveCountryAllowed(
  countryCode: string | null,
  access: CountryAccessRow | null
): boolean {
  if (!countryCode) return true;
  return access ? access.is_allowed : true;
}
