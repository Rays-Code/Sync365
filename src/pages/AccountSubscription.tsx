import { useEffect, useState, useCallback } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useUniqueId } from '@/hooks/useUniqueId';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from 'sonner';
import {
  ArrowLeft,
  Smartphone,
  LogOut,
  Loader2,
  CreditCard,
  Calendar,
  RotateCcw,
} from 'lucide-react';
import {
  userConfirmCheckout,
  userGetBillingAccount,
  userRequestPortal,
} from '@/services/supabaseFunctions';
import { AccountHubLinks } from '@/components/account/AccountHubLinks';
import { SubscriptionPlanSection } from '@/components/account/SubscriptionPlanSection';
import MyOrders from '@/components/dashboard/MyOrders';
import RequestRefund from '@/components/dashboard/RequestRefund';
import { parseBillingTab, ACCOUNT_BILLING_TABS, type AccountBillingTab } from '@/lib/accountTabs';

export default function AccountSubscription() {
  const { user, loading: authLoading, signOut } = useAuth();
  const { uniqueId } = useUniqueId({ email: user?.email });
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const [loading, setLoading] = useState(true);
  const [confirming, setConfirming] = useState(false);
  const [subscription, setSubscription] = useState<Record<string, unknown> | null>(null);

  const sessionId = searchParams.get('session_id');
  const mobileReturnUrl = searchParams.get('mobile_return_url');
  const activeTab = parseBillingTab(searchParams.get('tab'));

  const setActiveTab = (tab: AccountBillingTab) => {
    const next = new URLSearchParams(searchParams);
    next.set('tab', tab);
    if (sessionId) next.delete('session_id');
    setSearchParams(next, { replace: true });
  };

  const loadBilling = useCallback(async () => {
    if (!user) return;
    try {
      const subRes = await userGetBillingAccount('get-subscription', user.id);
      setSubscription((subRes?.subscription as Record<string, unknown>) ?? null);
    } catch (err) {
      console.error(err);
    }
  }, [user]);

  useEffect(() => {
    if (!authLoading && !user) {
      navigate('/billing/auth');
      return;
    }

    if (!user) return;

    async function init() {
      setLoading(true);
      try {
        if (sessionId) {
          setConfirming(true);
          const result = await userConfirmCheckout(sessionId);
          if (result.pending) {
            toast.message('Payment is still processing. This page will update shortly.');
          } else if (result.success) {
            toast.success('Payment complete! Your subscription is active.');
            setSubscription(result.subscription ?? null);
            if (mobileReturnUrl) {
              window.location.href = mobileReturnUrl.replace('{CHECKOUT_SESSION_ID}', sessionId ?? '');
              return;
            }
          }
          setSearchParams((prev) => {
            const next = new URLSearchParams(prev);
            next.delete('session_id');
            next.delete('mobile_return_url');
            return next;
          }, { replace: true });
        }
        await loadBilling();
      } catch (err: unknown) {
        const message = err instanceof Error ? err.message : 'Could not confirm payment';
        toast.error(message);
        await loadBilling();
      } finally {
        setConfirming(false);
        setLoading(false);
      }
    }

    init();
    // eslint-disable-next-line react-hooks/exhaustive-deps -- run once per user/session checkout
  }, [user, authLoading, sessionId, mobileReturnUrl, navigate, loadBilling]);

  useEffect(() => {
    if (searchParams.get('success') === 'true' && !sessionId) {
      toast.success('Welcome to Sync365 Plus!');
    }
  }, [searchParams, sessionId]);

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
  };

  const handleManageBilling = async () => {
    if (!user?.email) return;
    try {
      const res = await userRequestPortal(user.email);
      if (res?.url) window.location.href = res.url;
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Failed to open billing portal');
    }
  };

  if (authLoading || loading || confirming) {
    return (
      <div className="min-h-screen gradient-nebula flex flex-col items-center justify-center gap-3">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
        <p className="text-muted-foreground text-sm">
          {confirming ? 'Confirming your payment�' : 'Loading subscription�'}
        </p>
      </div>
    );
  }

  if (!user) return null;

  return (
    <div className="min-h-screen gradient-nebula">
      <div className="max-w-3xl mx-auto px-4 py-12">
        <div className="flex items-center justify-between mb-8">
          <Button
            variant="ghost"
            onClick={() => navigate('/')}
            className="text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Home
          </Button>
          <Button variant="ghost" onClick={handleSignOut} className="text-muted-foreground hover:text-foreground">
            <LogOut className="w-4 h-4 mr-2" />
            Sign Out
          </Button>
        </div>

        <h1 className="text-3xl font-semibold text-foreground mb-2">Billing & subscription</h1>
        <p className="text-muted-foreground mb-6">
          {uniqueId ? `User #${uniqueId}` : user.email}
        </p>

        <AccountHubLinks className="mb-8" />

        <div className="glass rounded-xl p-4 mb-8 flex items-center gap-3">
          <Smartphone className="w-5 h-5 text-primary shrink-0" />
          <p className="text-sm text-muted-foreground">
            <span className="text-foreground font-medium">Download the Sync365 app</span> to use premium features after subscribing.
          </p>
        </div>

        <Tabs value={activeTab} onValueChange={(v) => setActiveTab(parseBillingTab(v))} className="w-full">
          <TabsList className="w-full grid grid-cols-3 bg-muted/30 border border-border/50 mb-6">
            <TabsTrigger value={ACCOUNT_BILLING_TABS.subscription} className="text-xs sm:text-sm gap-1">
              <CreditCard className="w-4 h-4" />
              <span className="hidden sm:inline">Plan</span>
            </TabsTrigger>
            <TabsTrigger value={ACCOUNT_BILLING_TABS.orders} className="text-xs sm:text-sm gap-1">
              <Calendar className="w-4 h-4" />
              <span className="hidden sm:inline">Orders</span>
            </TabsTrigger>
            <TabsTrigger value={ACCOUNT_BILLING_TABS.refund} className="text-xs sm:text-sm gap-1">
              <RotateCcw className="w-4 h-4" />
              <span className="hidden sm:inline">Refund</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value={ACCOUNT_BILLING_TABS.subscription}>
            <SubscriptionPlanSection
              subscription={subscription}
              onRefresh={loadBilling}
              onManageBilling={handleManageBilling}
              onSubscribe={() => navigate('/pricing')}
            />
          </TabsContent>

          <TabsContent value={ACCOUNT_BILLING_TABS.orders}>
            <MyOrders userId={user.id} />
          </TabsContent>

          <TabsContent value={ACCOUNT_BILLING_TABS.refund}>
            <RequestRefund userId={user.id} userEmail={user.email || ''} />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
