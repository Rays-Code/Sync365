import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "@/hooks/use-toast";
import { Gift, Trophy, CreditCard, Sparkles } from "lucide-react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

const WaitlistPage = () => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email) {
      toast({
        title: "Email required",
        description: "Please enter your email address",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);
    
    try {
      const { supabase } = await import('@/integrations/supabase/client');
      
      // Insert into local waitlist table
      const { error: insertError } = await supabase.from('waitlist').insert({
        name: name || null,
        email: email
      });
      
      if (insertError) throw insertError;

      // Trigger the notification email via edge function
      const { sendWaitlistEmail } = await import('@/services/supabaseFunctions');
      await sendWaitlistEmail(email, name || 'Future Member');

      toast({
        title: "You're on the list!",
        description: "Keep an eye on your inbox for early access updates.",
      });
      
      setName("");
      setEmail("");
    } catch (error: any) {
      console.error('Waitlist error:', error);
      toast({
        title: "Already Registered or Error",
        description: error.message || "You might already be on the list, or an error occurred.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const incentives = [
    { icon: Sparkles, text: "Early Access / Beta Access to new features" },
    { icon: CreditCard, text: "Exclusive discounts & credits for early members" },
    { icon: Trophy, text: "Rewards & points for every referral" },
    { icon: Gift, text: "Wellness kits & stickers for top supporters" },
  ];

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="pt-32 pb-20">
        <section className="container max-w-[1200px] mx-auto px-4 flex justify-center">
          <div className="max-w-lg w-full p-8 md:p-10 rounded-2xl bg-card border border-border shadow-lg">
            
            <h1 className="font-heading font-bold text-3xl md:text-4xl text-center mb-3 text-foreground">
              Join the sync365 Early Access
            </h1>

            <p className="text-muted-foreground text-center mb-4">
              Be the first to use our AI-powered menstrual health companion.
            </p>
            <p className="text-gradient-cosmic font-medium text-center mb-6 text-sm">
              Smarter predictions • Better insights • Private & safe
            </p>
            
            <p className="text-muted-foreground text-center mb-4 text-sm">
              sync365 helps women track, understand, and predict their menstrual cycles with advanced AI.
            </p>
            <p className="text-foreground text-center mb-4 text-sm font-medium">
              Join our early access list to:
            </p>

            <ul className="space-y-4 mb-8">
              {incentives.map((item, index) => (
                <li key={index} className="flex items-start gap-3">
                  <div className="w-5 h-5 mt-0.5 flex-shrink-0 rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center">
                    <item.icon className="w-3 h-3 text-primary-foreground" />
                  </div>
                  <span className="text-foreground/90">{item.text}</span>
                </li>
              ))}
            </ul>

            <form onSubmit={handleSubmit} className="space-y-4">
              <Input
                type="text"
                placeholder="Your Name (optional)"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="h-12"
                disabled={isSubmitting}
              />
              
              <Input
                type="email"
                placeholder="Your Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="h-12"
                disabled={isSubmitting}
              />
              
              <Button 
                type="submit" 
                className="btn-cosmic w-full h-12 text-base font-semibold text-primary-foreground rounded-full"
                disabled={isSubmitting}
              >
                <span className="relative z-10">
                  {isSubmitting ? "Joining..." : "Join Waitlist"}
                </span>
              </Button>
            </form>
          </div>
        </section>
      </main>
      
      <Footer />
    </div>
  );
};

export default WaitlistPage;
