import { Sparkles, Heart, Shield, Activity } from "lucide-react";

const reasons = [
  {
    title: "Designed for You",
    description: "sync365 treats your cycle as a powerful, natural rhythm — not a medical condition. Our approach is empowering, personal, and beautifully designed.",
    icon: Heart,
  },
  {
    title: "Truly Private",
    description: "Your data is encrypted on your device before it ever leaves. We never sell or share your personal health information with anyone.",
    icon: Shield,
  },
  {
    title: "Smarter Over Time",
    description: "Our AI learns your unique patterns — even irregular ones. The more you use sync365, the more personalised your predictions and insights become.",
    icon: Sparkles,
  },
  {
    title: "Holistic Wellness",
    description: "Go beyond dates. Track mood, energy, sleep, and symptoms to understand the full picture of your cycle and how it connects to your lifestyle.",
    icon: Activity,
  },
];

const Testimonials = () => {
  return (
    <section className="py-20 relative overflow-hidden bg-background">
      {/* Background elements */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] rounded-full bg-secondary/5 blur-[150px]"></div>
      
      <div className="container max-w-[1200px] mx-auto px-4 relative z-10">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-display font-semibold mb-6 text-foreground">
            Why choose{" "}
            <span className="text-gradient-cosmic">sync365</span>
          </h2>
          <p className="text-lg text-foreground max-w-2xl mx-auto">
            Built with care, designed for empowerment, and powered by intelligent technology.
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {reasons.map((reason, index) => (
            <div 
              key={index} 
              className="glass rounded-3xl p-8 relative group hover:glow-secondary transition-all duration-500"
            >
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-primary to-secondary flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                <reason.icon className="w-7 h-7 text-primary-foreground" />
              </div>
              
              <h3 className="text-xl font-display font-semibold text-foreground mb-3">
                {reason.title}
              </h3>
              <p className="text-foreground leading-relaxed">
                {reason.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Testimonials;
