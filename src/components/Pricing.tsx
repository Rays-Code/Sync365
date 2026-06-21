import { useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Check, Sparkles, Crown, Loader2 } from "lucide-react";
import { usePricingPlans } from "@/hooks/usePricingPlans";
import { useCountry } from "@/contexts/CountryContext";
import { useCountryPricing } from "@/hooks/useCountryPricing";
import { COUNTRY_FEATURES } from "@/lib/countryFeatures";
import RegionUnavailable from "@/components/RegionUnavailable";

function formatPrice(price: number, currency: string): string {
  if (price === 0) return '$0';
  const symbols: Record<string, string> = { USD: '$', AUD: '$', GBP: '�', EUR: '�', INR: '?', PKR: 'Rs', BDT: '?' };
  const symbol = symbols[currency.toUpperCase()] || `${currency} `;
  return `${symbol}${price.toFixed(2)}`;
}

const Pricing = () => {
  const { plans, loading } = usePricingPlans();
  const { country, loading: loadingCountry, isFeatureEnabled } = useCountry();
  const { countryPricing, loading: loadingCP } = useCountryPricing(country);
  const checkoutAllowed = isFeatureEnabled(COUNTRY_FEATURES.SUBSCRIPTION_CHECKOUT);
  const corporateAllowed = isFeatureEnabled(COUNTRY_FEATURES.CORPORATE);
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'yearly'>('yearly');

  if (loading || loadingCountry || loadingCP) {
    return (
      <section id="pricing" className="py-20 relative overflow-hidden">
        <div className="absolute inset-0 gradient-nebula"></div>
        <div className="container max-w-[1200px] mx-auto px-4 relative z-10 flex justify-center">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      </section>
    );
  }

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

  const starter = plans.find(p => p.plan_key === 'starter');
  const plusMonthly = plans.find(p => p.plan_key === 'plus_monthly');
  const plusAnnual = plans.find(p => p.plan_key === 'plus_annual');
  const corporate = plans.find(p => p.plan_key === 'corporate');

  const activePlus = billingCycle === 'yearly' ? plusAnnual : plusMonthly;

  // Calculate savings for toggle hint
  let savingsPercent: number | null = null;
  if (plusMonthly && plusAnnual) {
    const monthlyResolved = getResolvedPrice(plusMonthly);
    const yearlyResolved = getResolvedPrice(plusAnnual);
    if (monthlyResolved.price > 0 && yearlyResolved.price > 0) {
      const annualized = monthlyResolved.price * 12;
      savingsPercent = Math.round(((annualized - yearlyResolved.price) / annualized) * 100);
    }
  }

  const displayPlans = [starter, activePlus, corporate].filter(Boolean) as typeof plans;

  return (
    <section id="pricing" className="py-20 relative overflow-hidden">
      <div className="absolute inset-0 gradient-nebula"></div>
      <div className="absolute top-0 left-1/4 w-[400px] h-[400px] rounded-full bg-primary/10 blur-[120px]"></div>
      <div className="absolute bottom-0 right-1/4 w-[300px] h-[300px] rounded-full bg-accent/10 blur-[100px]"></div>
      
      <div className="container max-w-[1200px] mx-auto px-4 relative z-10">
        <div className="text-center mb-10">
          <h2 className="text-4xl md:text-5xl font-display font-semibold mb-6 text-foreground">
            Choose your{" "}
            <span className="text-gradient-cosmic">plan</span>
          </h2>
          <p className="text-lg text-foreground/90 max-w-2xl mx-auto">
            Start free, upgrade when you're ready for deeper insights and premium features.
          </p>
        </div>

        
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto">
          {displayPlans.map((plan) => {
            const isCorporate = plan.plan_key === 'corporate';
            const isPlus = plan.plan_key === 'plus_annual' || plan.plan_key === 'plus_monthly';
            const Icon = isCorporate ? Crown : Sparkles;
            const rawFeatures = Array.isArray(plan.features) ? plan.features : [];
            const features = isCorporate
              ? rawFeatures.filter((f: string) => !f.toLowerCase().includes('dedicated support') && !f.toLowerCase().includes('custom onboarding'))
              : rawFeatures;
            const { price, currency, isRegional } = getResolvedPrice(plan);
            const priceDisplay = price === 0 ? 'Free' : formatPrice(price, currency);
            const originalPriceDisplay = isRegional && price !== plan.price ? formatPrice(plan.price, plan.currency) : null;
            const periodDisplay = price === 0 ? 'Forever free' : `per ${plan.billing_interval}`;

            return (
              <div
                key={plan.plan_key}
                className={`glass rounded-3xl p-8 flex flex-col h-full ${
                  isPlus
                    ? 'relative glow-primary border border-primary/50 shadow-xl'
                    : isCorporate
                    ? 'hover:glow-secondary transition-all duration-500'
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
                    <p className="text-sm text-foreground">{plan.description}</p>
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
                  <p className="text-foreground text-sm mt-1 font-medium">
                    {isCorporate ? 'per organisation' : periodDisplay}
                  </p>
                  {isPlus && billingCycle === 'yearly' && price > 0 && (
                    <p className="text-xs text-muted-foreground mt-1">
                      That's {formatPrice(price / 12, currency)}/month
                    </p>
                  )}
                  {isRegional && !isCorporate && (
                    <span className="inline-block mt-2 text-xs bg-primary/20 text-primary px-2 py-0.5 rounded-full">
                      {countryPricing?.is_free ? 'Free in your region' : 'Regional pricing'}
                    </span>
                  )}
                </div>
                
                {isCorporate ? (
                  corporateAllowed ? (
                  <Link to="/contact" className="mb-8">
                    <Button variant="outline" className="w-full border-secondary/50 text-foreground hover:bg-secondary/10 rounded-full h-14 text-base">
                      Contact Us
                    </Button>
                  </Link>
                  ) : (
                    <div className="mb-8">
                      <RegionUnavailable feature={COUNTRY_FEATURES.CORPORATE} compact className="text-center" />
                    </div>
                  )
                ) : isPlus ? (
                  checkoutAllowed ? (
                  <Link to="/pricing">
                    <Button className="mb-8 w-full btn-cosmic text-primary-foreground rounded-full h-14 text-base">
                      <span className="relative z-10">Get Plus</span>
                    </Button>
                  </Link>
                  ) : (
                    <div className="mb-8">
                      <RegionUnavailable feature={COUNTRY_FEATURES.SUBSCRIPTION_CHECKOUT} compact className="text-center" />
                    </div>
                  )
                ) : (
                  <Link to="/pricing">
                    <Button variant="outline" className="mb-8 border-border/50 text-foreground hover:bg-muted/50 rounded-full h-14 text-base">
                      Start Free
                    </Button>
                  </Link>
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
                      <span className={`text-sm ${isPlus ? 'text-foreground' : 'text-foreground/90'}`}>{feature}</span>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default Pricing;
