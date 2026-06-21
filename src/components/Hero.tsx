import { Button } from "@/components/ui/button";
import { Activity, Stars, Sparkles } from "lucide-react";
import AppQrCode from "@/components/AppQrCode";

const Hero = () => {
  return (
    <section className="min-h-screen pt-32 pb-20 relative overflow-hidden gradient-nebula">
      {/* Animated cosmic background elements */}
      <div className="absolute inset-0 overflow-hidden">
        {/* Nebula glow effects */}
        <div className="absolute top-20 right-20 w-96 h-96 rounded-full bg-secondary/20 blur-[100px] animate-pulse-slow"></div>
        <div className="absolute bottom-20 left-20 w-[500px] h-[500px] rounded-full bg-primary/15 blur-[120px] animate-pulse-slow" style={{ animationDelay: '1s' }}></div>
        <div className="absolute top-1/2 left-1/2 w-72 h-72 rounded-full bg-accent/10 blur-[80px] animate-pulse-slow" style={{ animationDelay: '2s' }}></div>
        
        {/* Floating stars */}
        {[...Array(20)].map((_, i) => (
          <div
            key={i}
            className="absolute w-1 h-1 rounded-full bg-foreground/60 animate-twinkle"
            style={{
              top: `${Math.random() * 100}%`,
              left: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 3}s`,
            }}
          />
        ))}
      </div>
      
      <div className="container max-w-[1200px] mx-auto px-4 relative z-10">
        <div className="flex flex-col lg:flex-row items-center gap-12 lg:gap-20">
          {/* Left content */}
          <div className="w-full lg:w-1/2 text-center lg:text-left">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass mb-8 border border-primary/20">
              <Stars className="w-4 h-4 text-primary" />
              <span className="text-sm text-foreground font-medium">Your wellness companion</span>
            </div>
            
            <h1 className="text-5xl md:text-6xl lg:text-7xl font-display font-semibold leading-[1.1] text-foreground mb-8">
              Your cycle,{" "}
              <span className="text-gradient-cosmic">in harmony</span>{" "}
              with you
            </h1>
            
            <p className="text-lg md:text-xl text-foreground mb-10 leading-relaxed max-w-xl mx-auto lg:mx-0">
              Empowering women with intelligent cycle tracking through modern AI technology. Your body, your rhythm, your sync365.
            </p>
            
            
            <div className="flex flex-col sm:flex-row items-center gap-8 justify-center lg:justify-start">
              <div className="flex items-center gap-8">
                <div className="text-center">
                  <p className="text-3xl font-display font-semibold text-gradient-rose">AI</p>
                  <p className="text-sm text-foreground font-medium">Smart Tracking</p>
                </div>
                <div className="w-px h-12 bg-border"></div>
                <div className="text-center">
                  <p className="text-3xl font-display font-semibold text-gradient-rose">🔒</p>
                  <p className="text-sm text-foreground font-medium">Private & Secure</p>
                </div>
                <div className="w-px h-12 bg-border"></div>
                <div className="text-center">
                  <p className="text-3xl font-display font-semibold text-gradient-rose">Free</p>
                  <p className="text-sm text-foreground font-medium">To Get Started</p>
                </div>
              </div>
            </div>

            {/* QR Code download */}
            <div className="mt-10 flex justify-center lg:justify-start">
              <AppQrCode size="sm" showLabel={true} />
            </div>
          </div>
          
          {/* Right content - Phone Mockup */}
          <div className="w-full lg:w-1/2 relative">
            <div className="relative mx-auto max-w-[350px]">
              {/* Orbital rings */}
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-[400px] h-[400px] rounded-full border border-primary/10 animate-spin" style={{ animationDuration: '30s' }}></div>
                <div className="absolute w-[320px] h-[320px] rounded-full border border-secondary/10 animate-spin" style={{ animationDuration: '25s', animationDirection: 'reverse' }}></div>
              </div>
              
              {/* Glow effects */}
              <div className="absolute -top-10 -left-10 w-40 h-40 bg-primary/20 rounded-full blur-[60px] animate-pulse-slow"></div>
              <div className="absolute -bottom-10 -right-10 w-40 h-40 bg-secondary/20 rounded-full blur-[60px] animate-pulse-slow" style={{ animationDelay: '1.5s' }}></div>
              
              {/* Phone mockup */}
              <div className="relative mx-auto w-full max-w-[320px] animate-float z-10 group">
                {/* Glow behind the phone */}
                <div className="absolute inset-4 bg-primary/20 blur-[60px] rounded-[60px] animate-pulse-slow"></div>
                
                {/* The Physical Phone Frame (Image from public folder) */}
                <img 
                  src="/mock-screen.png" 
                  alt="sync365 App Mockup" 
                  className="w-full h-auto relative z-20 drop-shadow-2xl"
                />

                {/* The Digital Screen Content (Inside the frame) */}
                <div className="absolute top-[2%] left-[5%] right-[5%] bottom-[2%] rounded-[40px] overflow-hidden bg-background z-10">
                  {/* Status Bar */}
                  <div className="absolute top-0 left-0 right-0 h-10 flex items-center justify-between px-6 z-30 pointer-events-none pt-2">
                    <span className="text-[10px] font-bold text-foreground">9:41</span>
                    <div className="flex items-center gap-1.5">
                      <div className="flex gap-0.5 items-end h-2">
                        <div className="w-[2px] h-1 bg-foreground/80 rounded-full"></div>
                        <div className="w-[2px] h-1.5 bg-foreground/80 rounded-full"></div>
                        <div className="w-[2px] h-2 bg-foreground/80 rounded-full"></div>
                        <div className="w-[2px] h-1 bg-foreground/30 rounded-full"></div>
                      </div>
                      <div className="w-5 h-2.5 rounded-[3px] border border-foreground/60 p-[1px] flex items-center">
                        <div className="w-full h-full bg-foreground/90 rounded-[1px]"></div>
                      </div>
                    </div>
                  </div>

                  {/* App Content */}
                  <div className="w-full h-full flex flex-col pt-14">
                    {/* App header */}
                    <div className="w-full py-5 px-6 bg-gradient-to-r from-primary/30 via-secondary/20 to-accent/30 border-b border-primary/10">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-[10px] text-foreground uppercase tracking-wider font-bold">Current Phase</p>
                          <h3 className="text-foreground font-display text-xl">Follicular</h3>
                        </div>
                        <Activity className="w-7 h-7 text-primary" />
                      </div>
                    </div>
                    
                    {/* Cycle visualization */}
                    <div className="text-center p-4 pb-8 flex-1 flex flex-col justify-between">
                      <div>
                        <div className="w-32 h-32 mx-auto rounded-full moon-phase flex items-center justify-center mb-3 animate-pulse-glow relative">
                          <div className="absolute inset-0 rounded-full bg-gradient-to-br from-primary/5 to-transparent animate-pulse"></div>
                          <span className="text-4xl font-display font-semibold text-background relative z-10">14</span>
                        </div>
                        <p className="text-sm text-foreground mb-0.5 font-medium">Day of your cycle</p>
                        <p className="text-primary font-bold text-base">Fertile Window</p>
                      </div>
                      
                      {/* Cycle visualization bars */}
                      <div className="mt-2 flex justify-center">
                        <div className="flex gap-1 items-end">
                          {[...Array(20)].map((_, i) => (
                            <div 
                              key={i} 
                              className={`w-[5px] rounded-full transition-all duration-500 ${
                                i < 4 ? "bg-primary h-6" : 
                                i >= 10 && i < 15 ? "bg-accent h-8" : 
                                i === 12 ? "bg-secondary h-10 scale-110 shadow-[0_0_8px_rgba(147,51,234,0.4)]" : 
                                "bg-muted h-4"
                              }`}
                            />
                          ))}
                        </div>
                      </div>
                      
                      {/* Insights */}
                      <div className="mt-4 space-y-2 px-1">
                        <div className="glass rounded-xl p-2.5 flex items-center justify-between border-white/40">
                          <span className="text-[10px] font-bold text-foreground">Energy</span>
                          <div className="flex gap-1">
                            {[...Array(5)].map((_, i) => (
                              <div key={i} className={`w-4 h-4 rounded-full ${i < 4 ? 'bg-accent' : 'bg-muted'}`} />
                            ))}
                          </div>
                        </div>
                        <div className="glass rounded-xl p-2.5 flex items-center justify-between border-white/40">
                          <span className="text-[10px] font-bold text-foreground">Mood</span>
                          <div className="flex gap-1">
                            {[...Array(5)].map((_, i) => (
                              <div key={i} className={`w-4 h-4 rounded-full ${i < 3 ? 'bg-primary' : 'bg-muted'}`} />
                            ))}
                          </div>
                        </div>
                      </div>
                      
                      <button className="mt-4 w-full btn-cosmic text-white py-3.5 rounded-2xl text-xs font-bold relative overflow-hidden shadow-lg">
                        <span className="relative z-10 flex items-center justify-center gap-2">
                          Log Today
                          <Sparkles size={12} className="animate-pulse" />
                        </span>
                      </button>
                    </div>
                  </div>

                  {/* Home Indicator */}
                  <div className="absolute bottom-1.5 left-1/2 -translate-x-1/2 w-24 h-1 bg-foreground/10 rounded-full z-40"></div>
                </div>
              </div>
              
              {/* Floating elements */}
              <div className="absolute top-20 -right-8 glass rounded-2xl px-4 py-3 animate-float z-30 shadow-2xl" style={{ animationDelay: '0.5s' }}>
                <div className="flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-accent" />
                  <span className="text-sm font-medium text-foreground">AI Insights</span>
                </div>
              </div>
              
              <div className="absolute bottom-28 -left-8 glass rounded-2xl px-4 py-3 animate-float z-30 shadow-2xl" style={{ animationDelay: '1s' }}>
                <div className="flex items-center gap-2">
                  <Activity className="w-4 h-4 text-primary" />
                  <span className="text-sm font-medium text-foreground">Smart Tracking</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;