import { useState } from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Building2, Users, Gift, Send } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import FeatureGate from '@/components/FeatureGate';
import { COUNTRY_FEATURES } from '@/lib/countryFeatures';

export default function CorporatePartnership() {
  const { toast } = useToast();
  const [formData, setFormData] = useState({
    companyName: '',
    contactName: '',
    email: '',
    phone: '',
    employees: '',
    message: ''
  });
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    
    // Simulate submission - in production this would send to an API
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    toast({
      title: "Request Submitted!",
      description: "Our partnership team will contact you within 2 business days.",
    });
    
    setFormData({
      companyName: '',
      contactName: '',
      email: '',
      phone: '',
      employees: '',
      message: ''
    });
    setSubmitting(false);
  };

  const benefits = [
    {
      icon: Gift,
      title: "Bulk Coupon Codes",
      description: "Distribute wellness benefits to your entire team with custom coupon codes"
    },
    {
      icon: Users,
      title: "Volume Pricing",
      description: "Discounted rates when you onboard your team — the more, the merrier"
    }
  ];



  return (
    <FeatureGate feature={COUNTRY_FEATURES.CORPORATE} showUnavailable className="min-h-screen gradient-nebula flex items-center justify-center px-4">
    <div className="min-h-screen gradient-nebula">
      <Header />
      
      <main className="pt-32 pb-20">
        {/* Hero Section */}
        <section className="container max-w-6xl mx-auto px-4 text-center mb-20">
          <Badge className="mb-6 bg-primary/20 text-primary border-primary/30">
            Corporate Partnerships
          </Badge>
          <h1 className="text-4xl md:text-6xl font-heading mb-6 text-gradient-cosmic">
            Empower Your Team's Wellness
          </h1>
          <p className="text-xl text-foreground/90 max-w-2xl mx-auto">
            Partner with sync365 to provide your employees with the world's most intelligent cycle tracking and wellness platform.
          </p>
        </section>

        {/* Benefits Grid */}
        <section className="container max-w-6xl mx-auto px-4 mb-20">
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {benefits.map((benefit, index) => (
              <Card key={index} className="glass border-border/50 hover:glow-primary transition-all duration-300">
                <CardHeader>
                  <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center mb-4">
                    <benefit.icon className="w-6 h-6 text-primary" />
                  </div>
                  <CardTitle className="font-heading text-lg">{benefit.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-foreground/90 text-sm">{benefit.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>



        {/* Contact Form */}
        <section className="container max-w-2xl mx-auto px-4">
          <Card className="glass border-border/50">
            <CardHeader className="text-center">
              <div className="w-16 h-16 rounded-full bg-primary/20 flex items-center justify-center mx-auto mb-4">
                <Building2 className="w-8 h-8 text-primary" />
              </div>
              <CardTitle className="font-heading text-2xl">Get Started Today</CardTitle>
              <CardDescription>Fill out the form below and our partnership team will reach out</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm text-foreground/90">Company Name</label>
                    <Input
                      placeholder="Acme Inc."
                      value={formData.companyName}
                      onChange={(e) => setFormData({ ...formData, companyName: e.target.value })}
                      required
                      className="bg-background/50"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm text-foreground/90">Contact Name</label>
                    <Input
                      placeholder="Jane Smith"
                      value={formData.contactName}
                      onChange={(e) => setFormData({ ...formData, contactName: e.target.value })}
                      required
                      className="bg-background/50"
                    />
                  </div>
                </div>
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm text-foreground/90">Email</label>
                    <Input
                      type="email"
                      placeholder="jane@acme.com"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      required
                      className="bg-background/50"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm text-foreground/90">Phone</label>
                    <Input
                      type="tel"
                      placeholder="+61 4XX XXX XXX"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      className="bg-background/50"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-sm text-foreground/90">Number of Employees</label>
                  <Input
                    type="number"
                    placeholder="100"
                    value={formData.employees}
                    onChange={(e) => setFormData({ ...formData, employees: e.target.value })}
                    required
                    className="bg-background/50"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm text-foreground/90">Message (Optional)</label>
                  <Textarea
                    placeholder="Tell us about your wellness goals..."
                    value={formData.message}
                    onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                    className="bg-background/50 min-h-[100px]"
                  />
                </div>
                <Button 
                  type="submit" 
                  className="btn-cosmic w-full"
                  disabled={submitting}
                >
                  {submitting ? (
                    <>Submitting...</>
                  ) : (
                    <>
                      <Send className="w-4 h-4 mr-2" />
                      Submit Partnership Request
                    </>
                  )}
                </Button>
              </form>
            </CardContent>
          </Card>
        </section>
      </main>

      <Footer />
    </div>
    </FeatureGate>
  );
}
