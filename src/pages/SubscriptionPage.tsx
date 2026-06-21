import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { Check, ArrowLeft, Smartphone, Loader2 } from 'lucide-react';
import { useState } from 'react';
import { usePricingPlans } from '@/hooks/usePricingPlans';
import { useCountry } from '@/contexts/CountryContext';
import { useCountryPricing } from '@/hooks/useCountryPricing';
import { COUNTRY_FEATURES } from '@/lib/countryFeatures';
import RegionUnavailable from '@/components/RegionUnavailable';
import { userRequestCheckout, activateFreePlan } from '@/services/supabaseFunctions';

function formatPrice(price: number, currency: string): string {
  if (price === 0) return 'Free';
  const symbols: Record<string, string> = { USD: '$', AUD: '$', GBP: '�', EUR: '�', INR: '?', PKR: 'Rs', BDT: '?' };
  const symbol = symbols[currency.toUpperCase()] || `${currency} `;
  return `${symbol}${price.toFixed(2)}`;
}

export default function SubscriptionPage() {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [processingPlan, setProcessingPlan] = useState<string | null>(null);
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'yearly'>('monthly');
  const { plans: dbPlans, loading: loadingPlans } = usePricingPlans();
  const { country, loading: loadingCountry, isFeatureEnabled } = useCountry();
  const { countryPricing, loading: loadingCP } = useCountryPricing(country);
  const checkoutAllowed = isFeatureEnabled(COUNTRY_FEATURES.SUBSCRIPTION_CHECKOUT);

  const getResolvedPrice = (plan: typeof dbPlans[0]) => {
    if (plan.plan_key === 'starter' || plan.plan_key === 'corporate') {
      return { price: plan.price, currency: plan.currency, isRegional: false };
    }
    if (countryPricing) {
      if (countryPricing.is_free) return { price: 0, currency: countryPricing.currency, isRegional: true };
      const price = plan.billing_interval === 'year' ? countryPricing.yearly_price : countryPricing.monthly_price;
      return { price, currency: countryPricing.currency, isRegional: true };
    }
    return { price: plan.price, currency: plan.currency, isRegional: false };
  };

  const handleSubscribe = async (plan: typeof dbPlans[0]) => {
    if (!user) {
      navigate('/billing/auth');
      return;
    }

    const planId = billingCycle === 'yearly' ? 'yearly' : 'monthly';
    setProcessingPlan(planId);

    if (!checkoutAllowed) {
      toast.error('Subscriptions are not available in your region.');
      setProcessingPlan(null);
      return;
    }

    const { price } = getResolvedPrice(plan);

    try {
      if (price === 0) {
        await activateFreePlan(user.id, user.email || '', planId, country || undefined);
        toast.success('Free subscription activated!');
        navigate('/account/subscription');
      } else {
        const res = await userRequestCheckout(
          planId,
          user.id,
          user.email || '',
          country || undefined
        );
        if (res?.url) {
          window.location.href = res.url;
        }
      }
    } catch (err: unknown) {
      const e = err as any;
      if (e.code === 'ALREADY_ON_PLAN') {
        toast.error('You\'re already on this plan.');
      } else {
        toast.error(e.message || 'Failed to start checkout');
      }
    } finally {
      setProcessingPlan(null);
    }
  };

  const loading = authLoading || loadingPlans || loadingCountry || loadingCP;

  if (loading) {
    return (
      <div className="min-h-screen gradient-nebula flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  const plusPlans = dbPlans.filter(p => p.plan_key === 'plus_monthly' || p.plan_key === 'plus_annual');
  const monthlyPlan = plusPlans.find(p => p.plan_key === 'plus_monthly');
  const yearlyPlan = plusPlans.find(p => p.plan_key === 'plus_annual');
  const activePlan = billingCycle === 'yearly' ? yearlyPlan : monthlyPlan;

  if (!activePlan) return null;

  const { price, currency, isRegional } = getResolvedPrice(activePlan);
  const isFree = price === 0;
  const features = Array.isArray(activePlan.features) ? activePlan.features as string[] : [];
  const planId = billingCycle;

  let savingsNote: string | null = null;
  if (monthlyPlan && yearlyPlan && billingCycle === 'yearly') {
    const monthlyResolved = getResolvedPrice(monthlyPlan);
    const yearlyResolved = getResolvedPrice(yearlyPlan);
    if (monthlyResolved.price > 0 && yearlyResolved.price > 0) {
      const annualizedMonthly = monthlyResolved.price * 12;
      const saved = annualizedMonthly - yearlyResolved.price;
      if (saved > 0) {
        savingsNote = `Save ${formatPrice(saved, yearlyResolved.currency)}/year`;
      }
    }
  }

  const badgeText = isRegional && isFree
    ? 'Free in your region'
    : isRegional
      ? 'Regional pricing'
      : savingsNote || undefined;

  return (
    <div className="min-h-screen gradient-nebula">
      <div className="max-w-2xl mx-auto px-4 py-12">
        <Button
          variant="ghost"
          onClick={() => navigate('/')}
          className="mb-8 text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Home
        </Button>

        <div className="text-center mb-10">
          <h1 className="text-4xl md:text-5xl font-semibold text-foreground mb-4" style={{ fontFamily: 'Cormorant Garamond, serif' }}>
            Sync365 Plus
          </h1>
          <p className="text-muted-foreground text-lg max-w-xl mx-auto">
            Unlock the full power of Sync365 with a Premium subscription.
            {country && <span className="text-sm ml-1">(Pricing for {country})</span>}
          </p>
        </div>

        <div className="flex items-center justify-center gap-1 mb-8">
          <div className="glass rounded-full p-1 flex items-center">
            <button
              onClick={() => setBillingCycle('monthly')}
              className={`px-5 py-2 rounded-full text-sm font-medium transition-all ${
                billingCycle === 'monthly'
                  ? 'bg-primary text-primary-foreground shadow-sm'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              Monthly
            </button>
            <button
              onClick={() => setBillingCycle('yearly')}
              className={`px-5 py-2 rounded-full text-sm font-medium transition-all ${
                billingCycle === 'yearly'
                  ? 'bg-primary text-primary-foreground shadow-sm'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              Yearly
            </button>
          </div>
          {savingsNote && billingCycle === 'monthly' && (
            <span className="text-xs text-accent ml-2">Switch to yearly & save!</span>
          )}
        </div>

        <div className="glass rounded-2xl p-8 relative max-w-lg mx-auto ring-2 ring-primary glow-primary">
          {badgeText && (
            <Badge className="absolute -top-3 left-1/2 -translate-x-1/2 gradient-rose-gold text-primary-foreground border-0">
              {badgeText}
            </Badge>
          )}

          <div className="text-center mb-6">
            <div className="flex items-baseline justify-center gap-2">
              <span className="text-5xl font-bold text-foreground">
                {formatPrice(price, currency)}
              </span>
              <span className="text-muted-foreground">
                {isFree ? '' : billingCycle === 'yearly' ? '/year' : '/month'}
              </span>
            </div>
            {billingCycle === 'monthly' && !isFree && (
              <p className="text-xs text-muted-foreground mt-2">
                Billed monthly � Auto-renews until you cancel
              </p>
            )}
            {isRegional && price !== activePlan.price && (
              <span className="text-sm line-through text-muted-foreground">
                {formatPrice(activePlan.price, activePlan.currency)}
              </span>
            )}
            {billingCycle === 'yearly' && !isFree && monthlyPlan && (
              <p className="text-xs text-muted-foreground mt-1">
                That's {formatPrice(price / 12, currency)}/month
              </p>
            )}
          </div>

          <ul className="space-y-3 mb-8">
            {features.map((feature) => (
              <li key={feature} className="flex items-start gap-2 text-sm text-muted-foreground">
                <Check className="w-4 h-4 text-accent mt-0.5 shrink-0" />
                {feature}
              </li>
            ))}
          </ul>

          {!checkoutAllowed ? (
            <RegionUnavailable feature={COUNTRY_FEATURES.SUBSCRIPTION_CHECKOUT} />
          ) : (
            <Button
              className="w-full btn-cosmic"
              onClick={() => handleSubscribe(activePlan)}
              disabled={processingPlan === planId}
            >
              {processingPlan === planId
                ? isFree ? 'Activating�' : 'Redirecting to Stripe...'
                : isFree
                  ? 'Activate Free Plan'
                  : billingCycle === 'monthly'
                    ? 'Subscribe monthly'
                    : 'Subscribe yearly'}
            </Button>
          )}
        </div>

        <div className="glass rounded-xl p-4 mt-8 flex items-center gap-3 max-w-lg mx-auto">
          <Smartphone className="w-5 h-5 text-primary shrink-0" />
          <p className="text-sm text-muted-foreground">
            <span className="text-foreground font-medium">Secure checkout via Stripe.</span>{' '}
            Monthly plans renew automatically each billing period.
          </p>
        </div>

        {!user && (
          <p className="text-center text-sm text-muted-foreground mt-8">
            Already have an account?{' '}
            <button onClick={() => navigate('/billing/auth')} className="text-primary hover:underline">
              Sign in
            </button>
          </p>
        )}
      </div>
    </div>
  );
}
