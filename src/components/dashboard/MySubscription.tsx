import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CreditCard, Sparkles, Loader2, ExternalLink, Repeat, RotateCcw } from 'lucide-react';
import { Link } from 'react-router-dom';
import { userGetBillingAccount, userRequestPortal } from '@/services/supabaseFunctions';
import { toast } from 'sonner';
import { formatBillingDate, formatPlanLabel, isMonthlyPlan } from '@/lib/billingDisplay';
import { billingTabHref } from '@/lib/accountTabs';

interface MySubscriptionProps {
  userId: string;
  userEmail: string;
  onRequestRefund?: () => void;
}

export default function MySubscription({ userId, userEmail, onRequestRefund }: MySubscriptionProps) {
  const [subscription, setSubscription] = useState<Record<string, unknown> | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchSubscription();
  }, [userId]);

  const fetchSubscription = async () => {
    try {
      setLoading(true);
      const res = await userGetBillingAccount('get-subscription', userId);
      setSubscription((res?.subscription as Record<string, unknown>) || null);
    } catch (err: unknown) {
      console.error('Subscription fetch error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleManageBilling = async () => {
    try {
      const res = await userRequestPortal(userEmail);
      if (res?.url) {
        window.location.href = res.url;
      }
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Failed to open billing portal');
    }
  };

  const isActive = subscription && ['active', 'trialing'].includes(String(subscription.status));
  const isFreeSubscription = subscription && (Number(subscription.amount) === 0 || (!subscription.stripe_customer_id && !subscription.stripe_subscription_id));

  return (
    <Card className="glass border-border/50">
      <CardHeader>
        <CardTitle className="font-heading text-xl flex items-center gap-2">
          <CreditCard className="w-5 h-5 text-primary" />
          My Subscription
        </CardTitle>
        <CardDescription>
          Your current plan and billing status �{' '}
          <Link to={billingTabHref('subscription')} className="text-primary hover:underline">
            Full billing page
          </Link>
        </CardDescription>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="flex justify-center py-8">
            <Loader2 className="w-6 h-6 animate-spin text-primary" />
          </div>
        ) : subscription ? (
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 rounded-lg bg-muted/30 border border-border/50">
              <div>
                <p className="text-sm text-muted-foreground">Plan</p>
                <p className="text-lg font-semibold">{formatPlanLabel(String(subscription.plan))}</p>
              </div>
              <div className="text-right">
                <p className="text-sm text-muted-foreground">Status</p>
                <span
                  className={`inline-block px-2 py-0.5 rounded-full text-xs font-medium ${
                    subscription.status === 'active'
                      ? 'bg-green-500/20 text-green-400'
                      : 'bg-yellow-500/20 text-yellow-400'
                  }`}
                >
                  {String(subscription.status || 'Unknown')}
                </span>
              </div>
            </div>
            {subscription.status === 'active' &&
              isMonthlyPlan(
                String(subscription.plan),
                subscription.billing_interval as string | undefined
              ) &&
              !subscription.cancel_at_period_end && (
                <div className="flex items-start gap-2 p-3 rounded-lg bg-primary/10 text-sm">
                  <Repeat className="w-4 h-4 text-primary mt-0.5 shrink-0" />
                  <p className="text-muted-foreground">
                    Auto-renews monthly � Next charge{' '}
                    <span className="text-foreground">
                      {formatBillingDate(subscription.end_date as string)}
                    </span>
                  </p>
                </div>
              )}
            {!isFreeSubscription ? (
              <Button variant="outline" className="w-full" onClick={handleManageBilling}>
                <ExternalLink className="w-4 h-4 mr-2" />
                Manage Billing
              </Button>
            ) : (
              <div className="p-3 rounded-lg bg-muted/30 text-sm text-center text-muted-foreground border border-border/50">
                You are on a free or fully discounted plan. No billing management is required.
              </div>
            )}
            {isActive &&
              (onRequestRefund ? (
                <Button
                  variant="ghost"
                  className="w-full text-muted-foreground"
                  onClick={onRequestRefund}
                >
                  <RotateCcw className="w-4 h-4 mr-2" />
                  Request a refund
                </Button>
              ) : (
                <Button variant="ghost" className="w-full text-muted-foreground" asChild>
                  <Link to={billingTabHref('refund')}>
                    <RotateCcw className="w-4 h-4 mr-2" />
                    Request a refund
                  </Link>
                </Button>
              ))}
          </div>
        ) : (
          <div className="text-center py-8 space-y-4">
            <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto">
              <Sparkles className="w-8 h-8 text-primary" />
            </div>
            <p className="text-foreground/80">No active subscription found.</p>
            <Button variant="outline" onClick={() => { window.location.href = '/pricing'; }}>
              View Plans
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
