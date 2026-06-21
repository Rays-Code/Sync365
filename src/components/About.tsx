import { Button } from "@/components/ui/button";
import { Activity, Sparkles, Star, Heart } from "lucide-react";

const About = () => {
  return (
    <section id="about" className="py-20 relative overflow-hidden">
      {/* Cosmic background */}
      <div className="absolute inset-0 gradient-nebula"></div>
      <div className="absolute top-1/4 right-0 w-[400px] h-[400px] rounded-full bg-primary/10 blur-[100px]"></div>
      <div className="absolute bottom-1/4 left-0 w-[300px] h-[300px] rounded-full bg-accent/10 blur-[80px]"></div>
      
      <div className="container max-w-[1200px] mx-auto px-4 relative z-10">
        <div className="flex flex-col lg:flex-row gap-16 items-center">
          {/* Visual side */}
          <div className="flex-1 order-2 lg:order-1">
            <div className="relative">
              {/* Main visual */}
              <div className="w-80 h-80 mx-auto relative">
                {/* Orbital paths */}
                <div className="absolute inset-0 rounded-full border border-border/30 animate-spin" style={{ animationDuration: '40s' }}></div>
                <div className="absolute inset-4 rounded-full border border-border/20 animate-spin" style={{ animationDuration: '30s', animationDirection: 'reverse' }}></div>
                <div className="absolute inset-8 rounded-full border border-border/10 animate-spin" style={{ animationDuration: '20s' }}></div>
                
                {/* Central icon */}
                <div className="absolute inset-16 rounded-full moon-phase animate-pulse-glow flex items-center justify-center">
                  <Activity className="w-16 h-16 text-background" />
                </div>
                
                {/* Orbiting elements */}
                <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-2">
                  <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center animate-float">
                    <Sparkles className="w-4 h-4 text-primary-foreground" />
                  </div>
                </div>
                <div className="absolute bottom-4 right-4">
                  <div className="w-6 h-6 rounded-full bg-accent flex items-center justify-center animate-float" style={{ animationDelay: '1s' }}>
                    <Star className="w-3 h-3 text-accent-foreground" />
                  </div>
                </div>
                <div className="absolute top-1/2 left-0 -translate-y-1/2">
                  <div className="w-7 h-7 rounded-full bg-secondary flex items-center justify-center animate-float" style={{ animationDelay: '2s' }}>
                    <Heart className="w-4 h-4 text-secondary-foreground" />
                  </div>
                </div>
              </div>
              
              {/* Info cards */}
              <div className="absolute -top-4 -right-4 glass rounded-2xl p-4 max-w-[200px]">
                <p className="text-xs text-foreground/90 mb-1">User-loved</p>
                <p className="text-sm text-foreground font-medium">97% user satisfaction</p>
              </div>
              
              <div className="absolute -bottom-4 -left-4 glass rounded-2xl p-4 max-w-[200px]">
                <p className="text-xs text-foreground/90 mb-1">AI-powered</p>
                <p className="text-sm text-foreground font-medium">Personalized insights</p>
              </div>
            </div>
          </div>
          
          {/* Content side */}
          <div className="flex-1 order-1 lg:order-2">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass mb-6">
              <Activity className="w-4 h-4 text-primary" />
              <span className="text-sm text-foreground font-medium">Our Philosophy</span>
            </div>
            
            <h2 className="text-4xl md:text-5xl font-display font-semibold mb-8 text-foreground">
              Understand your{" "}
              <span className="text-gradient-rose">natural rhythm</span>
            </h2>
            
            <p className="text-lg text-foreground mb-8 leading-relaxed">
              sync365 empowers you with intelligent cycle tracking, leveraging cutting-edge AI to provide personalized insights that help you understand your body better than ever before.
            </p>
            
            <div className="space-y-6 mb-10">
              <div className="flex gap-4">
                <div className="w-12 h-12 rounded-xl bg-primary/20 flex items-center justify-center flex-shrink-0">
                  <span className="text-primary font-display text-xl">01</span>
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-foreground mb-1">Track</h3>
                  <p className="text-foreground">Log your cycle, symptoms, and moods with our intuitive interface</p>
                </div>
              </div>
              
              <div className="flex gap-4">
                <div className="w-12 h-12 rounded-xl bg-secondary/20 flex items-center justify-center flex-shrink-0">
                  <span className="text-secondary font-display text-xl">02</span>
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-foreground mb-1">Discover</h3>
                  <p className="text-foreground">Our AI reveals patterns and connections unique to your body</p>
                </div>
              </div>
              
              <div className="flex gap-4">
                <div className="w-12 h-12 rounded-xl bg-accent/20 flex items-center justify-center flex-shrink-0">
                  <span className="text-accent font-display text-xl">03</span>
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-foreground mb-1">Thrive</h3>
                  <p className="text-foreground">Live in harmony with your cycle, optimizing energy and wellness</p>
                </div>
              </div>
            </div>
            
            <Button className="btn-cosmic text-primary-foreground px-8 py-6 h-auto rounded-full text-base font-medium">
              <span className="relative z-10">Discover Your Rhythm</span>
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default About;