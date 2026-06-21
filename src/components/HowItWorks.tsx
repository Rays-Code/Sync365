import { CreditCard, Download, Sparkles, UserPlus, ArrowRight, QrCode, Crown } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";

const HowItWorks = () => {
  const { user } = useAuth();

  const steps = [
    {
      icon: UserPlus,
      step: "01",
      title: "Create Your Account",
      description: "Sign up right here on this website — it's free and takes less than a minute. The Starter plan gives you instant access with no payment required.",
      cta: !user ? (
        <Link to="/auth">
          <Button className="btn-cosmic text-primary-foreground mt-4 rounded-full px-6 gap-2">
            <span className="relative z-10 flex items-center gap-2">Register Now <ArrowRight className="w-4 h-4" /></span>
          </Button>
        </Link>
      ) : (
        <Link to="/dashboard">
          <Button variant="outline" className="mt-4 rounded-full px-6 gap-2 border-primary/30 text-primary hover:bg-primary/10">
            Go to Dashboard <ArrowRight className="w-4 h-4" />
          </Button>
        </Link>
      ),
    },
    {
      icon: CreditCard,
      step: "02",
      title: "Choose Your Plan",
      description: "Once signed in, visit your dashboard to pick a plan. Stay on the free Starter plan or upgrade to unlock premium features — billing is managed entirely on this website.",
      cta: (
        <Link to={user ? "/dashboard" : "/pricing"}>
          <Button variant="outline" className="mt-4 rounded-full px-6 gap-2 border-primary/30 text-primary hover:bg-primary/10">
            {user ? "Manage Subscription" : "View Plans"} <ArrowRight className="w-4 h-4" />
          </Button>
        </Link>
      ),
    },
    {
      icon: Download,
      step: "03",
      title: "Download the App",
      description: "Scan the QR code or visit your app store to install sync365. Sign in with the same account you created here — your plan syncs automatically.",
      cta: (
        <div className="mt-4 flex flex-col items-center gap-2">
          <div className="w-20 h-20 rounded-xl bg-foreground/5 border border-border/50 flex items-center justify-center">
            <QrCode className="w-10 h-10 text-foreground/40" />
          </div>
          <span className="text-xs text-foreground font-medium">Coming soon</span>
        </div>
      ),
    },
    {
      icon: Sparkles,
      step: "04",
      title: "Enjoy Full Access",
      description: "Open the app and everything just works. Free users get Starter features instantly. Paid subscribers see premium features unlocked automatically — no codes or activation needed.",
      cta: (
        <div className="mt-4 inline-flex items-center gap-2 px-4 py-2 rounded-full bg-accent/10 border border-accent/20">
          <Crown className="w-4 h-4 text-accent" />
          <span className="text-xs text-accent font-medium">Premium unlocks automatically</span>
        </div>
      ),
    },
  ];

  const stepColors = [
    { bg: "bg-primary/20", border: "border-primary/50", icon: "text-primary", glow: "group-hover:shadow-[0_0_40px_hsl(var(--primary)/0.25)]", step: "text-primary" },
    { bg: "bg-secondary/20", border: "border-secondary/50", icon: "text-secondary", glow: "group-hover:shadow-[0_0_40px_hsl(var(--secondary)/0.25)]", step: "text-secondary" },
    { bg: "bg-accent/20", border: "border-accent/50", icon: "text-accent", glow: "group-hover:shadow-[0_0_40px_hsl(var(--accent)/0.25)]", step: "text-accent" },
    { bg: "bg-cosmic-gold/20", border: "border-cosmic-gold/50", icon: "text-cosmic-gold", glow: "group-hover:shadow-[0_0_40px_hsl(var(--cosmic-gold)/0.25)]", step: "text-cosmic-gold" },
  ];

  return (
    <section id="how-it-works" className="py-20 relative overflow-hidden bg-background">
      {/* Colourful ambient blobs */}
      <div className="absolute top-1/4 left-0 w-[500px] h-[500px] rounded-full bg-primary/8 blur-[150px] -translate-y-1/2"></div>
      <div className="absolute top-1/3 right-0 w-[400px] h-[400px] rounded-full bg-secondary/8 blur-[130px]"></div>
      <div className="absolute bottom-0 left-1/3 w-[350px] h-[350px] rounded-full bg-accent/8 blur-[120px]"></div>
      <div className="absolute bottom-1/4 right-1/4 w-[300px] h-[300px] rounded-full bg-cosmic-gold/6 blur-[100px]"></div>

      <div className="container max-w-[1200px] mx-auto px-4 relative z-10">
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass mb-6 border border-primary/20">
            <Sparkles className="w-4 h-4 text-cosmic-gold" />
            <span className="text-sm text-gradient-cosmic font-medium">Simple &amp; seamless</span>
          </div>
          <h2 className="text-4xl md:text-5xl lg:text-6xl font-display font-semibold mb-6 text-foreground">
            How it{" "}
            <span className="text-gradient-cosmic">works</span>
          </h2>
          <p className="text-lg text-foreground max-w-2xl mx-auto">
            Just like your favourite streaming service — subscribe on the web, download the app, and you're in.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto">
          {steps.map((s, i) => {
            const color = stepColors[i];
            return (
              <div key={i} className={`relative group`}>
                <div className={`glass rounded-3xl p-8 h-full border ${color.border} ${color.glow} transition-all duration-500 text-center flex flex-col items-center`}>
                  <div className={`text-xs font-mono ${color.step} mb-4 tracking-widest font-semibold`}>{s.step}</div>
                  <div className={`w-14 h-14 mx-auto rounded-2xl ${color.bg} flex items-center justify-center mb-5 transition-transform duration-300 group-hover:scale-110`}>
                    <s.icon className={`w-7 h-7 ${color.icon}`} />
                  </div>
                  <h3 className="text-lg font-display font-semibold text-foreground mb-2">{s.title}</h3>
                  <p className="text-sm text-foreground leading-relaxed">{s.description}</p>
                  {s.cta}
                </div>
              </div>
            );
          })}
        </div>

        {/* Starter callout */}
        <div className="max-w-3xl mx-auto mt-12 rounded-2xl p-6 text-center border border-primary/30 bg-gradient-to-r from-primary/10 via-secondary/10 to-accent/10 backdrop-blur-xl">
          <p className="text-foreground leading-relaxed">
            <span className="font-semibold text-gradient-cosmic">The Starter plan is completely free — forever.</span>{" "}
            No credit card needed. Create your account here, download the app, sign in, and start tracking right away. Upgrade only when you want more.
          </p>
        </div>
      </div>
    </section>
  );
};

export default HowItWorks;
