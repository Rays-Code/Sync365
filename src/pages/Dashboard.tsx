import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useUniqueId } from '@/hooks/useUniqueId';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Activity, LogOut, ArrowLeft, CreditCard, ShoppingBag, RotateCcw, Ticket, Settings } from 'lucide-react';
import AccountSettings from '@/components/dashboard/AccountSettings';
import MySubscription from '@/components/dashboard/MySubscription';
import MyOrders from '@/components/dashboard/MyOrders';
import RequestRefund from '@/components/dashboard/RequestRefund';
import RedeemCode from '@/components/dashboard/RedeemCode';
import { AccountHubLinks } from '@/components/account/AccountHubLinks';
import { parseDashboardTab, DASHBOARD_TABS, type DashboardTab } from '@/lib/accountTabs';

export default function Dashboard() {
  const { user, profile, loading, signOut } = useAuth();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const { uniqueId } = useUniqueId({ email: user?.email });
  const activeTab = parseDashboardTab(searchParams.get('tab'));

  const setActiveTab = (tab: DashboardTab) => {
    const next = new URLSearchParams(searchParams);
    next.set('tab', tab);
    setSearchParams(next, { replace: true });
  };

  useEffect(() => {
    if (!loading && !user) {
      navigate('/auth');
    }
  }, [user, loading, navigate]);

  if (loading) {
    return (
      <div className="min-h-screen gradient-nebula flex items-center justify-center">
        <Activity className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!user) return null;

  const displayName = profile?.username || (user.user_metadata?.full_name || user.email?.split('@')[0] || 'User');
  const initials = displayName.slice(0, 2).toUpperCase();

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
  };

  return (
    <div className="min-h-screen gradient-nebula">
      <header className="border-b border-border/50 glass-strong">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="icon" onClick={() => navigate('/')} className="text-muted-foreground hover:text-foreground">
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <div className="w-8 h-8 rounded-full gradient-rose-gold flex items-center justify-center">
              <Activity className="w-4 h-4 text-primary-foreground" />
            </div>
            <span className="font-heading text-xl text-gradient-rose">Sync365</span>
          </div>
          <Button variant="ghost" onClick={handleSignOut} className="text-muted-foreground hover:text-foreground gap-2">
            <LogOut className="w-4 h-4" />
            Sign Out
          </Button>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 max-w-3xl">
        <div className="text-center mb-6">
          <Avatar className="w-16 h-16 mx-auto mb-3 border-2 border-primary/30">
            <AvatarFallback className="bg-muted text-foreground text-lg font-heading">
              {initials}
            </AvatarFallback>
          </Avatar>
          <h1 className="font-heading text-2xl text-gradient-rose mb-1">
            Welcome, {displayName}
          </h1>
          <p className="text-sm text-muted-foreground">Manage your account & subscriptions</p>
        </div>

        <AccountHubLinks className="mb-6" />

        <Tabs value={activeTab} onValueChange={(v) => setActiveTab(parseDashboardTab(v))} className="w-full">
          <TabsList className="w-full grid grid-cols-5 bg-muted/30 border border-border/50">
            <TabsTrigger value={DASHBOARD_TABS.subscription} className="flex items-center gap-1.5 text-xs sm:text-sm">
              <CreditCard className="w-4 h-4" />
              <span className="hidden sm:inline">Subscription</span>
            </TabsTrigger>
            <TabsTrigger value={DASHBOARD_TABS.orders} className="flex items-center gap-1.5 text-xs sm:text-sm">
              <ShoppingBag className="w-4 h-4" />
              <span className="hidden sm:inline">Orders</span>
            </TabsTrigger>
            <TabsTrigger value={DASHBOARD_TABS.refund} className="flex items-center gap-1.5 text-xs sm:text-sm">
              <RotateCcw className="w-4 h-4" />
              <span className="hidden sm:inline">Refund</span>
            </TabsTrigger>
            <TabsTrigger value={DASHBOARD_TABS.redeem} className="flex items-center gap-1.5 text-xs sm:text-sm">
              <Ticket className="w-4 h-4" />
              <span className="hidden sm:inline">Redeem</span>
            </TabsTrigger>
            <TabsTrigger value={DASHBOARD_TABS.settings} className="flex items-center gap-1.5 text-xs sm:text-sm">
              <Settings className="w-4 h-4" />
              <span className="hidden sm:inline">Settings</span>
            </TabsTrigger>
          </TabsList>

          <div className="mt-6">
            <TabsContent value={DASHBOARD_TABS.subscription}>
              <MySubscription
                userId={user.id}
                userEmail={user.email || ''}
                onRequestRefund={() => setActiveTab(DASHBOARD_TABS.refund)}
              />
            </TabsContent>
            <TabsContent value={DASHBOARD_TABS.orders}>
              <MyOrders userId={user.id} />
            </TabsContent>
            <TabsContent value={DASHBOARD_TABS.refund}>
              <RequestRefund userId={user.id} userEmail={user.email || ''} />
            </TabsContent>
            <TabsContent value={DASHBOARD_TABS.redeem}>
              <RedeemCode userId={user.id} />
            </TabsContent>
            <TabsContent value={DASHBOARD_TABS.settings}>
              <AccountSettings
                email={user.email || ''}
                uniqueId={uniqueId}
                memberSince={user.created_at || null}
                onSignOut={handleSignOut}
              />
            </TabsContent>
          </div>
        </Tabs>
      </main>
    </div>
  );
}
