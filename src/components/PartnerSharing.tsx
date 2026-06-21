import { Users, Shield, Eye, ToggleRight, Lock, Crown } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import FeatureGate from "@/components/FeatureGate";
import { COUNTRY_FEATURES } from "@/lib/countryFeatures";

const privacyFeatures = [
  {
    icon: Users,
    title: "Explicit Invite Acceptance",
    description: "Your partner must actively accept your invitation before any data is shared.",
  },
  {
    icon: Eye,
    title: "Clear Data Sharing Consent",
    description: "Both partners see exactly what data will be shared and must consent before pairing.",
  },
  {
    icon: ToggleRight,
    title: "Revocation Anytime",
    description: "Stop sharing instantly whenever you choose — your data is removed from your partner's view immediately.",
  },
  {
    icon: Lock,
    title: "Granular Permission Control",
    description: "Choose exactly what to share — mood, cycle phase, energy — while keeping notes and symptoms private.",
  },
];

const PartnerSharing = () => {
  return (
    <FeatureGate feature={COUNTRY_FEATURES.PARTNER_SHARING} showUnavailable>
    <section id="partner-sharing" className="py-20 relative overflow-hidden bg-background">
      {/* Background elements */}
      <div className="absolute top-0 left-1/4 w-[500px] h-[500px] rounded-full bg-secondary/5 blur-[150px]"></div>
      <div className="absolute bottom-0 right-1/4 w-[400px] h-[400px] rounded-full bg-primary/5 blur-[120px]"></div>

      <div className="container max-w-[1200px] mx-auto px-4 relative z-10">
        {/* Header */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass mb-6">
            <Users className="w-4 h-4 text-secondary" />
            <span className="text-sm text-foreground font-medium">Partner Sharing</span>
            <span className="ml-1 text-xs font-medium bg-primary/20 text-primary px-2 py-0.5 rounded-full">Plus</span>
          </div>
          <h2 className="text-4xl md:text-5xl lg:text-6xl font-display font-semibold mb-6 text-foreground">
            Share your journey,{" "}
            <span className="text-gradient-cosmic">together</span>
          </h2>
          <p className="text-lg text-foreground max-w-2xl mx-auto">
            Invite your partner into your wellness world — with full control over what you share and complete privacy by design.
          </p>
        </div>

        <div className="max-w-3xl mx-auto">
          <div>
            <div className="flex items-center gap-2 mb-6">
              <Shield className="w-5 h-5 text-primary" />
              <h3 className="text-2xl font-display font-semibold text-foreground">
                Privacy First
              </h3>
            </div>
            <p className="text-foreground mb-8">
              Partner sharing is built with the same privacy-first principles as the rest of sync365. You're always in control.
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {privacyFeatures.map((feat, i) => (
                <div key={i} className="glass rounded-2xl p-6 hover:glow-accent transition-all duration-300">
                  <feat.icon className="w-8 h-8 text-primary mb-3" />
                  <h4 className="text-base font-semibold text-foreground mb-1">{feat.title}</h4>
                  <p className="text-sm text-foreground leading-relaxed">{feat.description}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Inclusivity statement */}
        <div className="max-w-3xl mx-auto mt-12 glass rounded-2xl p-6 text-center">
          <p className="text-foreground leading-relaxed">
            <span className="font-semibold text-foreground">sync365 supports all identities and relationship types.</span>{" "}
            If you menstruate, you can enable cycle tracking. If your partner supports you, they can be invited regardless of gender.
          </p>
        </div>

        {/* CTA */}
        <div className="text-center mt-16">
          <div className="inline-flex items-center gap-2 glass rounded-full px-5 py-2 mb-4">
            <Crown className="w-4 h-4 text-primary" />
            <span className="text-sm text-foreground">Available with the <span className="font-semibold text-primary">Plus</span> plan</span>
          </div>
          <div>
            <Link to="/pricing">
              <Button className="btn-cosmic text-primary-foreground px-10 py-6 h-auto rounded-full text-base font-medium">
                <span className="relative z-10">Get Plus — $99.99/year</span>
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </section>
    </FeatureGate>
  );
};

export default PartnerSharing;
