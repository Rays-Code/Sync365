import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';

export interface PricingPlan {
  id: string;
  plan_key: string;
  name: string;
  description: string | null;
  price: number;
  currency: string;
  billing_interval: string;
  stripe_price_id: string | null;
  stripe_product_id: string | null;
  features: string[];
  is_active: boolean;
  sort_order: number;
  discount_countries: string[];
  discount_price: number;
  discount_stripe_price_id: string | null;
  created_at: string;
  updated_at: string;
}

const STATIC_PLANS: PricingPlan[] = [
  {
    id: 'starter',
    plan_key: 'starter',
    name: 'Starter',
    description: 'Perfect for getting started',
    price: 0,
    currency: 'USD',
    billing_interval: 'forever',
    stripe_price_id: null,
    stripe_product_id: null,
    features: ['Cycle tracking', 'Basic predictions', 'Daily wellness insights'],
    is_active: true,
    sort_order: 1,
    discount_countries: [],
    discount_price: 0,
    discount_stripe_price_id: null,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: 'plus_monthly',
    plan_key: 'plus_monthly',
    name: 'Plus Monthly',
    description: 'Premium features billed monthly',
    price: 9.99,
    currency: 'USD',
    billing_interval: 'month',
    stripe_price_id: 'price_1SXuFd7fQuFoYSVZvgZSOTWJ',
    stripe_product_id: 'prod_plus',
    features: ['Partner sharing', 'Advanced AI insights', 'Priority support', 'Historical trends'],
    is_active: true,
    sort_order: 2,
    discount_countries: [],
    discount_price: 9.99,
    discount_stripe_price_id: null,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: 'plus_annual',
    plan_key: 'plus_annual',
    name: 'Plus Annual',
    description: 'Our most popular plan',
    price: 49.99,
    currency: 'USD',
    billing_interval: 'year',
    stripe_price_id: 'price_1SXtPK7fQuFoYSVZjaZ6RyV2',
    stripe_product_id: 'prod_plus',
    features: ['Partner sharing', 'Advanced AI insights', 'Priority support', 'Historical trends'],
    is_active: true,
    sort_order: 2,
    discount_countries: [],
    discount_price: 49.99,
    discount_stripe_price_id: null,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: 'corporate',
    plan_key: 'corporate',
    name: 'Corporate',
    description: 'For teams and organisations',
    price: 0,
    currency: 'USD',
    billing_interval: 'organisation',
    stripe_price_id: null,
    stripe_product_id: null,
    features: ['Bulk subscriptions', 'Admin dashboard', 'Custom onboarding'],
    is_active: true,
    sort_order: 3,
    discount_countries: [],
    discount_price: 0,
    discount_stripe_price_id: null,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  }
];

export function usePricingPlans() {
  const [plans, setPlans] = useState<PricingPlan[]>(STATIC_PLANS);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchPlans = useCallback(async () => {
    setLoading(true);
    try {
      const { data, error: dbError } = await supabase
        .from('pricing_plans')
        .select('*')
        .eq('is_active', true)
        .order('sort_order', { ascending: true });

      if (dbError) throw dbError;
      if (data?.length) {
        setPlans(
          data.map((row) => ({
            ...row,
            features: Array.isArray(row.features) ? row.features : [],
            discount_countries: row.discount_countries ?? [],
          })) as PricingPlan[]
        );
      } else {
        setPlans(STATIC_PLANS);
      }
      setError(null);
    } catch (err) {
      console.error('[usePricingPlans]', err);
      setPlans(STATIC_PLANS);
      setError(err instanceof Error ? err.message : 'Failed to load plans');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchPlans();
  }, [fetchPlans]);

  return { plans, loading, error, refetch: fetchPlans };
}
