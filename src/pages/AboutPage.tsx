import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Heart, Globe, Shield, Sparkles } from 'lucide-react';

export default function AboutPage() {
  const values = [
    {
      icon: Heart,
      title: "Women First",
      description: "Every feature is designed with women's needs at the center. We listen, learn, and iterate."
    },
    {
      icon: Shield,
      title: "Privacy Always",
      description: "Your health data is sacred. We never sell it, share it, or use it for advertising."
    },
    {
      icon: Sparkles,
      title: "Science-Backed",
      description: "Our algorithms are developed with leading OB-GYNs and reproductive health experts."
    },
    {
      icon: Globe,
      title: "Inclusive Design",
      description: "sync365 is built for all women, regardless of cycle regularity, health conditions, or life stage."
    }
  ];

  const team = [
    {
      name: "Arnab Mondal",
      role: "Founder & CEO",
      bio: "Visionary entrepreneur who started sync365 in Melbourne to empower women with intelligent cycle tracking through AI technology."
    },
    {
      name: "Dr Nazish Idrees Chaudhary",
      role: "PhD · Advisory Panel",
      bio: "Member of the Australian & New Zealand Mental Health Association, bringing expert psychological insight to sync365's approach to women's wellbeing."
    }
  ];

  const milestones = [
    { year: "2020", event: "Ideation began in Melbourne" },
    { year: "2021", event: "Development started" },
    { year: "2023", event: "sync365 naming & branding finalized" },
    { year: "2023–2024", event: "AI prediction engine analysis & development" },
    { year: "2025", event: "AI cycle prediction and guard rail implementation" }
  ];

  return (
    <div className="min-h-screen gradient-nebula">
      <Header />
      
      <main className="pt-32 pb-20">
        {/* Hero */}
        <section className="container max-w-6xl mx-auto px-4 text-center mb-20">
          <Badge className="mb-6 bg-primary/20 text-primary border-primary/30">
            About Us
          </Badge>
          <h1 className="text-4xl md:text-6xl font-heading mb-6 text-gradient-cosmic">
            Our Mission
          </h1>
          <p className="text-xl text-foreground max-w-3xl mx-auto leading-relaxed">
            We believe every woman deserves to understand her body deeply. sync365 was created to bridge the gap between complex reproductive health science and everyday life, using AI to make personalized insights accessible to all.
          </p>
        </section>

        {/* Values */}
        <section className="container max-w-6xl mx-auto px-4 mb-20">
          <h2 className="text-3xl font-heading text-center mb-12">Our Values</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {values.map((value, index) => (
              <Card key={index} className="glass border-border/50 text-center">
                <CardContent className="p-6">
                  <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center mx-auto mb-4">
                    <value.icon className="w-6 h-6 text-primary" />
                  </div>
                  <h3 className="font-heading text-lg mb-2">{value.title}</h3>
                  <p className="text-sm text-foreground">{value.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>


        {/* Timeline */}
        <section className="container max-w-4xl mx-auto px-4 mb-20">
          <h2 className="text-3xl font-heading text-center mb-12">Our Journey</h2>
          <div className="relative">
            <div className="absolute left-1/2 top-0 bottom-0 w-px bg-border" />
            <div className="space-y-8">
              {milestones.map((milestone, index) => (
                <div key={index} className={`flex items-center gap-8 ${index % 2 === 0 ? 'flex-row' : 'flex-row-reverse'}`}>
                  <div className={`flex-1 ${index % 2 === 0 ? 'text-right' : 'text-left'}`}>
                    <div className="text-2xl font-heading text-primary">{milestone.year}</div>
                    <div className="text-foreground">{milestone.event}</div>
                  </div>
                  <div className="w-4 h-4 rounded-full bg-primary relative z-10" />
                  <div className="flex-1" />
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Team */}
        <section className="container max-w-6xl mx-auto px-4">
          <h2 className="text-3xl font-heading text-center mb-12">Leadership Team</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {team.map((member, index) => (
              <Card key={index} className="glass border-border/50">
                <CardContent className="p-6 text-center">
                  <div className="w-20 h-20 rounded-full bg-gradient-to-br from-primary/30 to-secondary/30 mx-auto mb-4 flex items-center justify-center">
                    <span className="text-2xl font-heading">{member.name.split(' ').map(n => n[0]).join('')}</span>
                  </div>
                  <h3 className="font-heading text-lg">{member.name}</h3>
                  <p className="text-sm text-primary mb-2">{member.role}</p>
                  <p className="text-xs text-foreground">{member.bio}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
