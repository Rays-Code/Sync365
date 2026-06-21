import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { CreditCard, RefreshCw, Repeat, RotateCcw } from 'lucide-react';
import {
  formatBillingDate,
  formatPlanLabel,
  isMonthlyPlan,
} from '@/lib/billingDisplay';
import { billingTabHref } from '@/lib/accountTabs';
import { Link } from 'react-router-dom';

interface SubscriptionPlanSectionProps {
  subscription: Record<string, unknown> | null;
  onRefresh: () => void;
  onManageBilling: () => void;
  onSubscribe?: () => void;
  showRefundLink?: boolean;
}

export function SubscriptionPlanSection({
  subscription,
  onRefresh,
  onManageBilling,
  onSubscribe,
  showRefundLink = true,
}: SubscriptionPlanSectionProps) {
  const status = String(subscription?.status ?? '');
  const plan = String(subscription?.plan ?? '');
  const isActive = ['active', 'trialing'].includes(status);
  const monthly = isMonthlyPlan(plan, subscription?.billing_interval as string | undefined);
  const nextBill = subscription?.end_date as string | undefined;
  const autoRenew = isActive && !subscription?.cancel_at_period_end;

  return (
    <section className="glass rounded-2xl p-6 border border-border/50">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-semibold text-foreground flex items-center gap-2">
          <CreditCard className="w-5 h-5 text-primary" />
          Current Plan
        </h2>
        <Button variant="ghost" size="icon" onClick={onRefresh} aria-label="Refresh">
          <RefreshCw className="w-4 h-4" />
        </Button>
      </div>

      {subscription && isActive ? (
        <div className="space-y-4">
          <div className="flex flex-wrap items-center gap-3">
            <p className="text-2xl font-semibold text-foreground">{formatPlanLabel(plan)}</p>
            <Badge className="bg-green-500/20 text-green-400 border-0 capitalize">{status}</Badge>
          </div>

          {monthly && autoRenew && (
            <div className="flex items-start gap-2 p-3 rounded-lg bg-primary/10 border border-primary/20">
              <Repeat className="w-4 h-4 text-primary mt-0.5 shrink-0" />
              <div className="text-sm">
                <p className="text-foreground font-medium">Auto-renewal enabled</p>
                <p className="text-muted-foreground">
                  Your card will be charged automatically each month. Next billing date:{' '}
                  <span className="text-foreground">{formatBillingDate(nextBill)}</span>
                </p>
              </div>
            </div>
          )}

          {!monthly && autoRenew && nextBill && (
            <p className="text-sm text-muted-foreground">
              Renews on <span className="text-foreground">{formatBillingDate(nextBill)}</span>
            </p>
          )}

          {subscription.cancel_at_period_end && (
            <p className="text-sm text-amber-500">
              Cancels at end of period ({formatBillingDate(nextBill)}).
            </p>
          )}

          {subscription.queued_plan && (
            <p className="text-sm text-muted-foreground">
              Queued upgrade to <span className="capitalize">{String(subscription.queued_plan)}</span>
              {subscription.queued_start_date
                ? ` starting ${formatBillingDate(subscription.queued_start_date as string)}`
                : ''}
              .
            </p>
          )}

          <Button variant="outline" className="w-full" onClick={onManageBilling}>
            Manage payment method & billing
          </Button>

          {showRefundLink && (
            <Button variant="ghost" className="w-full text-muted-foreground" asChild>
              <Link to={billingTabHref('refund')}>
                <RotateCcw className="w-4 h-4 mr-2" />
                Request a refund
              </Link>
            </Button>
          )}
        </div>
      ) : subscription ? (
        <div className="space-y-4">
          <p className="text-muted-foreground capitalize">Status: {status || 'inactive'}</p>
          <Button onClick={onSubscribe}>Subscribe again</Button>
        </div>
      ) : (
        <div className="text-center py-6 space-y-4">
          <p className="text-muted-foreground">No active subscription yet.</p>
          <Button onClick={onSubscribe}>View plans</Button>
        </div>
      )}
    </section>
  );
}
