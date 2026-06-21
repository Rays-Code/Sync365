import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import { useEffect } from "react";
import { AuthProvider } from "@/contexts/AuthContext";
import { CountryProvider } from "@/contexts/CountryContext";
import { VisitTracker } from "@/components/VisitTracker";
import Index from "./pages/Index";
import SamplePages from "./pages/SamplePages";
import NotFound from "./pages/NotFound";
import Auth from "./pages/Auth";
import AuthCallback from "./pages/AuthCallback";
import AdminLogin from "./pages/AdminLogin";
import AdminDashboard from "./pages/admin/AdminDashboard";
import EmailPreview from "./pages/admin/EmailPreview";
import MigrationPlan from "./pages/admin/MigrationPlan";
import Dashboard from "./pages/Dashboard";
import ContentPage from "./pages/ContentPage";
import CorporatePartnership from "./pages/CorporatePartnership";
import PricingPage from "./pages/PricingPage";
import AboutPage from "./pages/AboutPage";
import WaitlistPage from "./pages/WaitlistPage";
import ContactPage from "./pages/ContactPage";
import RefundPolicyPage from "./pages/RefundPolicyPage";
import BillingAuth from "./pages/BillingAuth";
import AccountSubscription from "./pages/AccountSubscription";
import LinkedInSetup from "./pages/LinkedInSetup";


const queryClient = new QueryClient();

function ScrollToTop() {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);
  return null;
}

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <CountryProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner position="top-center" richColors />
        <BrowserRouter>
          <ScrollToTop />
          <VisitTracker />
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/samples" element={<SamplePages />} />
            <Route path="/auth" element={<Auth />} />
            <Route path="/auth/callback" element={<AuthCallback />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/admin/login" element={<AdminLogin />} />
            <Route path="/admin" element={<AdminDashboard />} />
            <Route path="/admin/emails" element={<EmailPreview />} />
            <Route path="/admin/migration" element={<MigrationPlan />} />
            
            {/* Billing Portal */}
            <Route path="/billing/auth" element={<BillingAuth />} />
            <Route path="/subscription" element={<PricingPage />} />
            <Route path="/account/subscription" element={<AccountSubscription />} />
            
            {/* Static Pages */}
            <Route path="/pricing" element={<PricingPage />} />
            <Route path="/about" element={<AboutPage />} />
            <Route path="/corporate" element={<CorporatePartnership />} />
            <Route path="/waitlist" element={<WaitlistPage />} />
            <Route path="/contact" element={<ContactPage />} />
            <Route path="/refund-policy" element={<RefundPolicyPage />} />
            
            {/* Dynamic Content Pages */}
            <Route path="/page/:slug" element={<ContentPage />} />
            
            {/* Internal Tools */}
            <Route path="/linkedin-setup" element={<LinkedInSetup />} />
            
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
      </CountryProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
