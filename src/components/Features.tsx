import { Activity, Brain, Shield, Sparkles, Heart, Users } from "lucide-react";
import { useCountry } from "@/contexts/CountryContext";
import { COUNTRY_FEATURES, type CountryFeatureKey } from "@/lib/countryFeatures";

const features: {
  title: string;
  description: string;
  icon: typeof Activity;
  gradient: string;
  featureKey?: CountryFeatureKey;
}[] = [
  {
    title: "Intelligent Tracking",
    description: "Track your cycle with precision using our smart algorithms that learn and adapt to your unique patterns.",
    icon: Activity,
    gradient: "from-primary to-secondary"
  },
  {
    title: "AI-Powered Predictions",
    description: "Our smart algorithms learn your unique rhythm, improving prediction quality after just three cycles.",
    icon: Brain,
    gradient: "from-secondary to-accent",
    featureKey: COUNTRY_FEATURES.AI_INSIGHTS,
  },
  {
    title: "Privacy Sanctuary",
    description: "End-to-end encryption ensures your intimate data stays yours. We never sell or share your information.",
    icon: Shield,
    gradient: "from-accent to-primary"
  },
  {
    title: "Personalized Insights",
    description: "Receive personalized guidance based on your cycle phase, energy levels, and wellness patterns.",
    icon: Sparkles,
    gradient: "from-primary to-accent",
    featureKey: COUNTRY_FEATURES.AI_INSIGHTS,
  },
  {
    title: "Holistic Wellness",
    description: "Track mood, sleep, nutrition, and symptoms to understand your body's complete story.",
    icon: Heart,
    gradient: "from-secondary to-primary"
  },
  {
    title: "Partner Sharing",
    description: "Share selected insights with your partner — with explicit consent, granular controls, and instant revocation.",
    icon: Users,
    gradient: "from-accent to-secondary",
    featureKey: COUNTRY_FEATURES.PARTNER_SHARING,
  }
];

const Features = () => {
  const { loading, isFeatureEnabled } = useCountry();

  const visibleFeatures = loading
    ? features
    : features.filter((f) => !f.featureKey || isFeatureEnabled(f.featureKey));

  return (
    <section id="features" className="py-20 relative overflow-hidden bg-background">
      <div className="absolute top-0 right-0 w-[600px] h-[600px] rounded-full bg-secondary/5 blur-[150px]"></div>
      <div className="absolute bottom-0 left-0 w-[500px] h-[500px] rounded-full bg-primary/5 blur-[120px]"></div>
      
      <div className="container max-w-[1200px] mx-auto px-4 relative z-10">
        <div className="text-center mb-20">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass mb-6">
            <Sparkles className="w-4 h-4 text-primary" />
            <span className="text-sm text-foreground font-medium">Smart Features</span>
          </div>
          <h2 className="text-4xl md:text-5xl lg:text-6xl font-display font-semibold mb-6 text-foreground">
            Where <span className="text-gradient-cosmic">science</span> meets wellness
          </h2>
          <p className="text-lg text-foreground max-w-2xl mx-auto">
            sync365 combines intelligent cycle tracking with cutting-edge artificial intelligence to create an experience unlike any other.
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {visibleFeatures.map((feature, index) => (
            <div 
              key={index} 
              className="group glass rounded-3xl p-8 hover:glow-primary transition-all duration-500 hover:-translate-y-2"
            >
              <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${feature.gradient} flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300`}>
                <feature.icon className="w-7 h-7 text-primary-foreground" />
              </div>
              <h3 className="text-xl font-display font-semibold text-foreground mb-3">
                {feature.title}
              </h3>
              <p className="text-foreground leading-relaxed">
                {feature.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Features;
