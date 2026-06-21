import { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Users, ShoppingCart, CreditCard, ArrowLeftRight, 
  Ticket, Percent, RotateCcw, Settings, LogOut, 
  Loader2, ArrowLeft, Shield, Mail, Smartphone, BarChart3, DollarSign, Flag, Archive, Heart, Cloud, SlidersHorizontal
} from 'lucide-react';
import UsersTab from '@/components/admin/UsersTab';
import OrdersTab from '@/components/admin/OrdersTab';
import SubscriptionsTab from '@/components/admin/SubscriptionsTab';
import TransactionsTab from '@/components/admin/TransactionsTab';
import CodesTab from '@/components/admin/CodesTab';
import StripeCouponsTab from '@/components/admin/StripeCouponsTab';

import RefundsTab from '@/components/admin/RefundsTab';
import SettingsTab from '@/components/admin/SettingsTab';
import AppDataTab from '@/components/admin/AppDataTab';
import AnalyticsOverview from '@/components/admin/AnalyticsOverview';
import PricingTab from '@/components/admin/PricingTab';
import FeatureFlagsTab from '@/components/admin/FeatureFlagsTab';
import ArchiveSettingsTab from '@/components/admin/ArchiveSettingsTab';
import FertilityDataTab from '@/components/admin/FertilityDataTab';
import AppSettingsTab from '@/components/admin/AppSettingsTab';

export default function AdminDashboard() {
  const { user, isAdmin, loading, signOut } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('analytics');

  useEffect(() => {
    if (!loading && (!user || !isAdmin)) {
      navigate('/admin/login');
    }
  }, [user, isAdmin, loading, navigate]);

  const handleSignOut = async () => {
    await signOut();
    navigate('/admin/login');
  };

  if (loading) {
    return (
      <div className="min-h-screen gradient-nebula flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!user || !isAdmin) {
    return null;
  }

  return (
    <div className="min-h-screen gradient-nebula">
      {/* Header */}
      <header className="border-b border-border/50 bg-card/50 backdrop-blur-lg sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={() => navigate('/')}
              className="text-muted-foreground hover:text-foreground"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back
            </Button>
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full gradient-rose-gold flex items-center justify-center">
                <span className="font-heading text-lg font-bold text-primary-foreground">f</span>
              </div>
              <span className="font-heading text-xl text-foreground">sync365</span>
              <span className="text-xs bg-secondary/20 text-secondary px-2 py-0.5 rounded-full border border-secondary/30">
                Admin
              </span>
            </div>
          </div>
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={handleSignOut}
            className="text-muted-foreground hover:text-foreground"
          >
            <LogOut className="w-4 h-4 mr-2" />
            Sign Out
          </Button>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="font-heading text-3xl text-foreground flex items-center gap-3">
              <Shield className="w-8 h-8 text-secondary" />
              Admin Dashboard
            </h1>
            <p className="text-muted-foreground mt-1">
              Manage users, orders, and subscriptions
            </p>
          </div>
          <div className="flex gap-2">
            <Link to="/admin/migration">
              <Button variant="outline" className="border-border hover:bg-muted/50">
                <Cloud className="w-4 h-4 mr-2" />
                Migration Plan
              </Button>
            </Link>
            <Link to="/admin/emails">
              <Button variant="outline" className="border-border hover:bg-muted/50">
                <Mail className="w-4 h-4 mr-2" />
                Email Templates
              </Button>
            </Link>
          </div>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="bg-card/50 border border-border/50 p-1 flex flex-wrap gap-1 h-auto">
            <TabsTrigger value="analytics" className="data-[state=active]:bg-accent data-[state=active]:text-accent-foreground">
              <BarChart3 className="w-4 h-4 mr-2" />
              Analytics
            </TabsTrigger>
            <TabsTrigger value="appdata" className="data-[state=active]:bg-secondary data-[state=active]:text-secondary-foreground">
              <Smartphone className="w-4 h-4 mr-2" />
              App Data
            </TabsTrigger>

            <TabsTrigger value="users" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
              <Users className="w-4 h-4 mr-2" />
              Users
            </TabsTrigger>
            <TabsTrigger value="orders" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
              <ShoppingCart className="w-4 h-4 mr-2" />
              Orders
            </TabsTrigger>
            <TabsTrigger value="subscriptions" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
              <CreditCard className="w-4 h-4 mr-2" />
              Subscriptions
            </TabsTrigger>
            <TabsTrigger value="transactions" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
              <ArrowLeftRight className="w-4 h-4 mr-2" />
              Transactions
            </TabsTrigger>
            <TabsTrigger value="codes" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
              <Ticket className="w-4 h-4 mr-2" />
              Codes
            </TabsTrigger>
            <TabsTrigger value="stripecoupons" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
              <Percent className="w-4 h-4 mr-2" />
              Coupons
            </TabsTrigger>
            <TabsTrigger value="refunds" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
              <RotateCcw className="w-4 h-4 mr-2" />
              Refunds
            </TabsTrigger>
            <TabsTrigger value="pricing" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
              <DollarSign className="w-4 h-4 mr-2" />
              Pricing
            </TabsTrigger>
            <TabsTrigger value="featureflags" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
              <Flag className="w-4 h-4 mr-2" />
              Feature Flags
            </TabsTrigger>
            <TabsTrigger value="fertility" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
              <Heart className="w-4 h-4 mr-2" />
              Fertility Data
            </TabsTrigger>
            <TabsTrigger value="archive" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
              <Archive className="w-4 h-4 mr-2" />
              Archive
            </TabsTrigger>
            <TabsTrigger value="appsettings" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
              <SlidersHorizontal className="w-4 h-4 mr-2" />
              App Settings
            </TabsTrigger>
            <TabsTrigger value="settings" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
              <Settings className="w-4 h-4 mr-2" />
              Settings
            </TabsTrigger>
          </TabsList>

          <TabsContent value="analytics">
            <AnalyticsOverview />
          </TabsContent>
          <TabsContent value="appdata">
            <AppDataTab />
          </TabsContent>

          <TabsContent value="users">
            <UsersTab />
          </TabsContent>
          <TabsContent value="orders">
            <OrdersTab />
          </TabsContent>
          <TabsContent value="subscriptions">
            <SubscriptionsTab />
          </TabsContent>
          <TabsContent value="transactions">
            <TransactionsTab />
          </TabsContent>
          <TabsContent value="codes">
            <CodesTab />
          </TabsContent>
          <TabsContent value="stripecoupons">
            <StripeCouponsTab />
          </TabsContent>
          <TabsContent value="refunds">
            <RefundsTab />
          </TabsContent>
          <TabsContent value="pricing">
            <PricingTab />
          </TabsContent>
          <TabsContent value="featureflags">
            <FeatureFlagsTab />
          </TabsContent>
          <TabsContent value="fertility">
            <FertilityDataTab />
          </TabsContent>
          <TabsContent value="archive">
            <ArchiveSettingsTab />
          </TabsContent>
          <TabsContent value="appsettings">
            <AppSettingsTab />
          </TabsContent>
          <TabsContent value="settings">
            <SettingsTab />
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}
