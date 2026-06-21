import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

export interface CountryPricingEntry {
  id: string;
  country_code: string;
  country_name: string;
  monthly_price: number;
  yearly_price: number;
  currency: string;
  monthly_stripe_price_id: string | null;
  yearly_stripe_price_id: string | null;
  is_free: boolean;
}

export interface ResolvedPricing {
  monthlyPrice: number;
  yearlyPrice: number;
  currency: string;
  isFree: boolean;
  isRegional: boolean;
  countryCode: string | null;
  monthlyStripePriceId: string | null;
  yearlyStripePriceId: string | null;
}

export function useCountryPricing(detectedCountry: string | null) {
  const [countryPricing, setCountryPricing] = useState<CountryPricingEntry | null>(null);
  const [allCountryPricing, setAllCountryPricing] = useState<CountryPricingEntry[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!detectedCountry) {
      setCountryPricing(null);
      setLoading(false);
      return;
    }

    const code = detectedCountry.toUpperCase();
    let cancelled = false;

    async function load() {
      setLoading(true);
      try {
        const { data, error } = await supabase
          .from('country_pricing')
          .select('*')
          .eq('country_code', code)
          .maybeSingle();

        if (cancelled) return;
        if (error) throw error;
        setCountryPricing(data as CountryPricingEntry | null);
      } catch (err) {
        console.error('[useCountryPricing] Failed to load pricing:', err);
        if (!cancelled) setCountryPricing(null);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    load();
    return () => {
      cancelled = true;
    };
  }, [detectedCountry]);

  const resolvePricing = (
    defaultMonthlyPrice: number,
    defaultYearlyPrice: number,
    defaultCurrency: string
  ): ResolvedPricing => {
    if (countryPricing) {
      return {
        monthlyPrice: countryPricing.monthly_price,
        yearlyPrice: countryPricing.yearly_price,
        currency: countryPricing.currency,
        isFree: countryPricing.is_free,
        isRegional: true,
        countryCode: detectedCountry,
        monthlyStripePriceId: countryPricing.monthly_stripe_price_id,
        yearlyStripePriceId: countryPricing.yearly_stripe_price_id,
      };
    }
    return {
      monthlyPrice: defaultMonthlyPrice,
      yearlyPrice: defaultYearlyPrice,
      currency: defaultCurrency,
      isFree: false,
      isRegional: false,
      countryCode: detectedCountry,
      monthlyStripePriceId: null,
      yearlyStripePriceId: null,
    };
  };

  return { countryPricing, allCountryPricing, loading, resolvePricing };
}
