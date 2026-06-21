import { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Check, Sparkles, Crown, Activity, Loader2, Smartphone } from 'lucide-react';
import { usePricingPlans } from '@/hooks/usePricingPlans';
import { useCountry } from '@/contexts/CountryContext';
import { useCountryPricing } from '@/hooks/useCountryPricing';
import { COUNTRY_FEATURES } from '@/lib/countryFeatures';
import RegionUnavailable from '@/components/RegionUnavailable';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import AppQrCode from '@/components/AppQrCode';
import { userRequestCheckout, activateFreePlan } from '@/services/supabaseFunctions';

function formatPrice(price: number, currency: string): string {
  if (price === 0) return 'Free';
  const symbols: Record<string, string> = { USD: '$', AUD: '$', GBP: '�', EUR: '�', INR: '?', PKR: 'Rs', BDT: '?' };
  const symbol = symbols[currency.toUpperCase()] || `${currency} `;
  return `${symbol}${price.toFixed(2)}`;
}

export default function PricingPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { plans, loading } = usePricingPlans();
  const { country, loading: loadingCountry, isFeatureEnabled } = useCountry();
  const { countryPricing, loading: loadingCP } = useCountryPricing(country);
  const checkoutAllowed = isFeatureEnabled(COUNTRY_FEATURES.SUBSCRIPTION_CHECKOUT);
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'yearly'>('yearly');
  const [processingPlan, setProcessingPlan] = useState<string | null>(null);
  const isMobileCheckout =
    searchParams.get('mobile_auth') === '1' || searchParams.get('source') === 'mobile_app';
  const mobileSuccessUrl = searchParams.get('success_url') || undefined;
  const mobileCancelUrl = searchParams.get('cancel_url') || undefined;

  const getMobileCheckoutSuccessUrl = () => {
    if (!mobileSuccessUrl || typeof window === 'undefined') return mobileSuccessUrl;

    const params = new URLSearchParams({
      session_id: '{CHECKOUT_SESSION_ID}',
      success: 'true',
      tab: 'subscription',
      mobile_return_url: mobileSuccessUrl,
    });

    const url = `${window.location.origin}/account/subscription?${params.toString()}`;
    return url.replace(/%7BCHECKOUT_SESSION_ID%7D/g, '{CHECKOUT_SESSION_ID}');
  };

  const getResolvedPrice = (plan: typeof plans[0]) => {
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

  const requestPaidCheckout = async (
    planId: 'monthly' | 'yearly',
    successUrl?: string,
    cancelUrl?: string
  ) => {
    const res = await userRequestCheckout(
      planId,
      user!.id,
      user!.email || '',
      country || undefined,
      successUrl,
      cancelUrl
    );
    if (res?.url) {
      window.location.href = res.url;
    }
  };

  const handleSubscribe = async (plan: typeof plans[0]) => {
    if (!user) {
      if (isMobileCheckout) {
        toast.error('Could not restore your app login. Please return to the app and try again.');
      } else {
        navigate('/billing/auth');
      }
      return;
    }

    const planId =
      plan.plan_key === 'plus_annual' || plan.billing_interval === 'year'
        ? 'yearly'
        : 'monthly';
    setProcessingPlan(planId);

    if (!checkoutAllowed) {
      toast.error('Subscriptions are not available in your region.');
      return;
    }

    try {
      if (getResolvedPrice(plan).price === 0) {
        // Activate free plan
        await activateFreePlan(user.id, user.email || '', planId, country || undefined);
        toast.success("Free subscription activated!");
        navigate('/account/subscription');
      } else {
        // Create checkout session
        await requestPaidCheckout(
          planId,
          isMobileCheckout ? getMobileCheckoutSuccessUrl() : undefined,
          isMobileCheckout ? mobileCancelUrl : undefined
        );
      }
    } catch (error: any) {
      if (error.code === 'ALREADY_ON_PLAN') {
        navigate('/account/subscription');
        setTimeout(() => toast.error('You\'re already on this plan.'), 200);
      } else {
        toast.error(error.message || 'Failed to process subscription');
      }
    } finally {
      setProcessingPlan(null);
    }
  };

  const starter = plans.find(p => p.plan_key === 'starter');
  const plusMonthly = plans.find(p => p.plan_key === 'plus_monthly');
  const plusAnnual = plans.find(p => p.plan_key === 'plus_annual');
  const corporate = plans.find(p => p.plan_key === 'corporate');
  const activePlus = billingCycle === 'yearly' ? plusAnnual : plusMonthly;

  let savingsPercent: number | null = null;
  if (plusMonthly?.stripe_price_id && plusAnnual?.stripe_price_id) {
    const monthlyResolved = getResolvedPrice(plusMonthly);
    const yearlyResolved = getResolvedPrice(plusAnnual);
    if (monthlyResolved.price > 0 && yearlyResolved.price > 0) {
      const annualized = monthlyResolved.price * 12;
      savingsPercent = Math.round(((annualized - yearlyResolved.price) / annualized) * 100);
    }
  }

  const displayPlans = [starter, activePlus, corporate].filter(Boolean) as typeof plans;

  const faqs = [
    { q: "Can I try before I buy?", a: "Yes! Our Starter plan is completely free forever, so you can try the app before upgrading." },
    { q: "Can I cancel anytime?", a: "Absolutely. Cancel your subscription anytime with no questions asked." },
    { q: "Is my data secure?", a: "Your data is encrypted end-to-end and never shared or sold. We comply with GDPR and Australian privacy laws." },
    { q: "How does partner sharing work?", a: "With the Plus plan, you can invite your partner via a unique pairing code. You choose exactly what to share � mood, cycle phase, energy � while keeping notes private. Both partners must consent, and you can revoke access instantly." }
  ];

  return (
    <div className="min-h-screen gradient-nebula">
      <Header />
      
      <main className="pt-32 pb-20">
        {isMobileCheckout && (
          <section className="container max-w-2xl mx-auto px-4 mb-8">
            <div className="glass rounded-2xl p-5 border border-primary/20 text-center">
              <p className="font-medium mb-2">Complete your app upgrade</p>
              <p className="text-sm text-muted-foreground">
                Choose a Plus plan below. Stripe checkout will open after you tap the plan button.
              </p>
            </div>
          </section>
        )}

        {/* Hero */}
        <section className="container max-w-6xl mx-auto px-4 text-center mb-16">
          <Badge className="mb-6 bg-primary/20 text-primary border-primary/30">Pricing</Badge>
          <h1 className="text-4xl md:text-6xl font-heading mb-6 text-gradient-cosmic">Choose Your Path</h1>
          <p className="text-xl text-foreground/90 max-w-2xl mx-auto">
            Start free and upgrade as your wellness journey evolves.
            {country && <span className="text-sm ml-1">(Pricing for {country})</span>}
          </p>
        </section>

        {/* Pricing Cards */}
        <section className="container max-w-6xl mx-auto px-4 mb-20">
          {(loading || loadingCountry || loadingCP) ? (
            <div className="flex justify-center py-20">
              <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
          ) : (
            <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
              {displayPlans.map((plan) => {
                const isCorporate = plan.plan_key === 'corporate';
                const isPlus = plan.plan_key === 'plus_annual' || plan.plan_key === 'plus_monthly';
                const isStarter = plan.plan_key === 'starter';
                const Icon = isCorporate ? Crown : isPlus ? Sparkles : Activity;
                const rawFeatures = Array.isArray(plan.features) ? plan.features : [];
                const features = isCorporate
                  ? rawFeatures.filter((f: string) => !f.toLowerCase().includes('dedicated support') && !f.toLowerCase().includes('custom onboarding'))
                  : rawFeatures;
                const hasStripePrice = plan.plan_key === 'starter' || plan.plan_key === 'corporate' || !!plan.stripe_price_id;
                const { price, currency, isRegional } = getResolvedPrice(plan);
                const priceDisplay = !hasStripePrice ? 'Currently unavailable' : price === 0 ? 'Free' : formatPrice(price, currency);
                const originalPriceDisplay = !hasStripePrice ? null : isRegional && price !== plan.price ? formatPrice(plan.price, plan.currency) : null;
                const periodDisplay = !hasStripePrice ? '' : price === 0 ? 'Forever free' : `per ${plan.billing_interval}`;
                const planId = plan.billing_interval === 'year' ? 'yearly' : 'monthly';

                return (
                  <div
                    key={plan.plan_key}
                    className={`glass rounded-3xl p-8 flex flex-col h-full ${
                      isPlus
                        ? 'relative glow-primary border border-primary/30 scale-105'
                        : 'hover:glow-accent transition-all duration-500'
                    }`}
                  >
                    {isPlus && (
                      <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-gradient-to-r from-primary to-secondary text-primary-foreground text-xs font-medium py-2 px-6 rounded-full">
                        Most Popular
                      </div>
                    )}

                    <div className="flex items-center gap-3 mb-4">
                      <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${
                        isPlus ? 'bg-primary/20' : isCorporate ? 'bg-secondary/20' : 'bg-accent/20'
                      }`}>
                        <Icon className={`w-6 h-6 ${
                          isPlus ? 'text-primary' : isCorporate ? 'text-secondary' : 'text-accent'
                        }`} />
                      </div>
                      <div>
                        <h3 className="text-xl font-display font-semibold text-foreground">
                          {isPlus ? 'Plus' : plan.name}
                        </h3>
                        <p className="text-sm text-foreground/90">{plan.description}</p>
                      </div>
                    </div>

                    {/* Billing toggle inside Plus card */}
                    {isPlus && (
                      <div className="flex items-center gap-2 mb-4">
                        <div className="bg-muted/50 rounded-full p-0.5 flex items-center w-full">
                          <button
                            onClick={() => setBillingCycle('monthly')}
                            className={`flex-1 px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
                              billingCycle === 'monthly'
                                ? 'bg-primary text-primary-foreground shadow-sm'
                                : 'text-muted-foreground hover:text-foreground'
                            }`}
                          >
                            Monthly
                          </button>
                          <button
                            onClick={() => setBillingCycle('yearly')}
                            className={`flex-1 px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
                              billingCycle === 'yearly'
                                ? 'bg-primary text-primary-foreground shadow-sm'
                                : 'text-muted-foreground hover:text-foreground'
                            }`}
                          >
                            Yearly
                            {savingsPercent && savingsPercent > 0 && (
                              <span className="ml-1 text-[10px] opacity-80">(-{savingsPercent}%)</span>
                            )}
                          </button>
                        </div>
                      </div>
                    )}

                    <div className="mb-8">
                      <p className={`text-5xl font-display font-semibold ${isPlus ? 'text-gradient-rose' : 'text-foreground'}`}>
                        {isCorporate ? 'Custom' : priceDisplay}
                      </p>
                      {originalPriceDisplay && !isCorporate && (
                        <p className="text-sm line-through text-foreground/50 mt-1">{originalPriceDisplay}</p>
                      )}
                      <p className="text-foreground/90 text-sm mt-1">
                        {isCorporate ? 'per organisation' : periodDisplay}
                      </p>
                      {isPlus && billingCycle === 'yearly' && price > 0 && (
                        <p className="text-xs text-muted-foreground mt-1">
                          That's {formatPrice(price / 12, currency)}/month
                        </p>
                      )}
                      {isPlus && billingCycle === 'monthly' && price > 0 && (
                        <p className="text-xs text-muted-foreground mt-1">
                          Billed monthly � Auto-renews until cancelled
                        </p>
                      )}
                      {isRegional && !isCorporate && (
                        <span className="inline-block mt-2 text-xs bg-primary/20 text-primary px-2 py-0.5 rounded-full">
                          {countryPricing?.is_free ? 'Free in your region' : 'Regional pricing'}
                        </span>
                      )}
                    </div>

                    {isCorporate ? (
                      <Link to="/contact" className="mb-8">
                        <Button variant="outline" className="w-full border-secondary/50 text-foreground hover:bg-secondary/10 rounded-full h-14 text-base">
                          Contact Us
                        </Button>
                      </Link>
                    ) : !hasStripePrice ? (
                      <div className="mb-8">
                        <Button disabled className="w-full rounded-full h-14 text-base border-border/50 text-muted-foreground" variant="outline">
                          Currently unavailable
                        </Button>
                      </div>
                    ) : !checkoutAllowed && isPlus ? (
                      <div className="mb-8">
                        <RegionUnavailable feature={COUNTRY_FEATURES.SUBSCRIPTION_CHECKOUT} compact className="text-center" />
                      </div>
                    ) : (
                      <Button
                        className={`mb-8 w-full rounded-full h-14 text-base ${isPlus ? 'btn-cosmic text-primary-foreground' : 'border-border/50 text-foreground hover:bg-muted/50'}`}
                        variant={isStarter ? 'outline' : 'default'}
                        onClick={() => handleSubscribe(plan)}
                        disabled={processingPlan === planId || (isPlus && !checkoutAllowed)}
                      >
                        {processingPlan === planId
                          ? price === 0 ? 'Activating�' : 'Redirecting to Stripe...'
                          : isPlus
                            ? <span className="relative z-10">Get Plus</span>
                            : 'Start Free'
                        }
                      </Button>
                    )}

                    <div className="space-y-4 mt-auto">
                      {features.map((feature, i) => (
                        <div key={i} className="flex items-center gap-3">
                          <div className={`w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 ${
                            isPlus ? 'bg-primary/20' : isCorporate ? 'bg-secondary/20' : 'bg-accent/20'
                          }`}>
                            <Check className={`w-3 h-3 ${
                              isPlus ? 'text-primary' : isCorporate ? 'text-secondary' : 'text-accent'
                            }`} />
                          </div>
                          <span className={`text-sm ${isPlus ? 'text-foreground' : 'text-foreground/80'}`}>{feature}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </section>

        {/* Download App QR (Hidden after backend removal) */}
        {/*
        {user && (
          <section className="container max-w-4xl mx-auto px-4 mb-20">
            ...
          </section>
        )}
        */}

        {/* Corporate */}
        <section className="container max-w-4xl mx-auto px-4 mb-20">
          <Card className="glass border-border/50 text-center">
            <CardHeader>
              <CardTitle className="font-heading text-2xl">Looking for Corporate Plans?</CardTitle>
              <p className="text-foreground/90">Empower your entire team with discounted bulk subscriptions</p>
            </CardHeader>
            <CardContent>
              <Link to="/corporate">
                <Button variant="outline" className="border-primary text-primary hover:bg-primary/10">
                  Learn About Corporate Partnerships
                </Button>
              </Link>
            </CardContent>
          </Card>
        </section>

        {/* Not signed in prompt */}
        {!user && (
          <section className="container max-w-4xl mx-auto px-4 mb-12 text-center">
            <p className="text-sm text-muted-foreground">
              Already have an account?{' '}
              <button onClick={() => navigate('/billing/auth')} className="text-primary hover:underline">
                Sign in
              </button>
            </p>
          </section>
        )}

        {/* FAQs */}
        <section className="container max-w-4xl mx-auto px-4">
          <h2 className="text-3xl font-heading text-center mb-12">Frequently Asked Questions</h2>
          <div className="grid md:grid-cols-2 gap-6">
            {faqs.map((faq, index) => (
              <Card key={index} className="glass border-border/50">
                <CardHeader>
                  <CardTitle className="font-heading text-lg">{faq.q}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-foreground/90">{faq.a}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
