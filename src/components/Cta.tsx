import { Button } from "@/components/ui/button";
import { ArrowRight, Activity, Sparkles, Shield } from "lucide-react";

const Cta = () => {
  return (
    <section className="py-20 relative overflow-hidden">
      {/* Cosmic gradient background */}
      <div className="absolute inset-0 bg-gradient-to-br from-secondary/30 via-background to-primary/20"></div>
      
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-10 left-10 w-2 h-2 rounded-full bg-foreground/40 animate-twinkle"></div>
        <div className="absolute top-1/4 right-20 w-1 h-1 rounded-full bg-foreground/60 animate-twinkle" style={{ animationDelay: '0.5s' }}></div>
        <div className="absolute bottom-1/3 left-1/4 w-1.5 h-1.5 rounded-full bg-foreground/50 animate-twinkle" style={{ animationDelay: '1s' }}></div>
        <div className="absolute top-1/2 right-1/3 w-1 h-1 rounded-full bg-foreground/40 animate-twinkle" style={{ animationDelay: '1.5s' }}></div>
        <div className="absolute bottom-20 right-10 w-2 h-2 rounded-full bg-foreground/30 animate-twinkle" style={{ animationDelay: '2s' }}></div>
        
        {/* Large glow orbs */}
        <div className="absolute -top-20 -left-20 w-[400px] h-[400px] rounded-full bg-secondary/20 blur-[100px]"></div>
        <div className="absolute -bottom-20 -right-20 w-[400px] h-[400px] rounded-full bg-primary/20 blur-[100px]"></div>
      </div>
      
      <div className="container max-w-[900px] mx-auto px-4 relative z-10">
        <div className="text-center">
          {/* Visual */}
          <div className="w-24 h-24 mx-auto mb-10 rounded-full moon-phase animate-pulse-glow flex items-center justify-center">
            <Activity className="w-10 h-10 text-background" />
          </div>
          
          <h2 className="text-4xl md:text-5xl lg:text-6xl font-display font-semibold leading-tight mb-8 text-foreground">
            Start your wellness journey{" "}
            <span className="text-gradient-cosmic">today</span>
          </h2>
          
          <p className="text-xl text-foreground mb-12 max-w-2xl mx-auto leading-relaxed">
            Discover a deeper connection to your body with intelligent cycle tracking, designed for the way you live.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-16">
            <Button className="btn-cosmic text-primary-foreground px-10 py-7 h-auto rounded-full text-lg font-medium glow-primary">
              <span className="relative z-10 flex items-center gap-2">
                Start Your Free Trial
                <ArrowRight className="w-5 h-5" />
              </span>
            </Button>
            <Button variant="outline" className="border-border text-foreground hover:bg-muted/50 px-10 py-7 h-auto rounded-full text-lg font-medium glass">
              Download App
            </Button>
          </div>
          
          {/* Trust badges */}
          <div className="flex flex-wrap items-center justify-center gap-8">
            <div className="flex items-center gap-2 glass px-5 py-3 rounded-full">
              <Shield className="w-5 h-5 text-primary" />
              <span className="text-sm text-foreground">End-to-End Encrypted</span>
            </div>
            <div className="flex items-center gap-2 glass px-5 py-3 rounded-full">
              <Sparkles className="w-5 h-5 text-accent" />
              <span className="text-sm text-foreground">AI-Powered Insights</span>
            </div>
            <div className="flex items-center gap-2 glass px-5 py-3 rounded-full">
              <Activity className="w-5 h-5 text-secondary" />
              <span className="text-sm text-foreground">Free to Start</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Cta;