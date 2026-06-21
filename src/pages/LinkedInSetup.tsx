import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Download, ExternalLink, Copy, CheckCircle2, Globe, Users, Building2, FileText, MessageSquare, Hash } from "lucide-react";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { Navigate } from "react-router-dom";

const LinkedInSetup = () => {
  const { toast } = useToast();
  const { user, isAdmin } = useAuth();
  const [copiedField, setCopiedField] = useState<string | null>(null);

  // Only admins can access this page
  if (!user || !isAdmin) {
    return <Navigate to="/" replace />;
  }

  const copyToClipboard = (text: string, field: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(field);
    toast({ title: "Copied!", description: `${field} copied to clipboard.` });
    setTimeout(() => setCopiedField(null), 2000);
  };

  const fields = [
    {
      section: "Company Identity",
      icon: <Building2 className="w-5 h-5" />,
      items: [
        { label: "Company Name", value: "sync365", note: "Exact brand name" },
        { label: "Logo", value: "Download the logo below (300×300px square)", note: "Use sync365-logo.png for your company profile picture" },
        { label: "LinkedIn Public URL", value: "linkedin.com/company/sync365app", note: "Claim this custom URL" },
        { label: "Tagline (120 chars max)", value: "AI-Powered Period & Wellness Tracking — Your Cycle, Your Power, Your Wellness.", note: "Shows below your company name" },
        { label: "Industry", value: "Health, Wellness & Fitness", note: "Primary industry" },
        { label: "Company Size", value: "2-10 employees", note: "Select from dropdown" },
        { label: "Company Type", value: "Privately Held", note: "Select from dropdown" },
        { label: "Founded", value: "2025", note: "Year founded" },
      ],
    },
    {
      section: "About Section",
      icon: <FileText className="w-5 h-5" />,
      items: [
        {
          label: "About (2,000 chars max)",
          value: `sync365 is a next-generation AI-powered women's health platform that helps you track your cycle, log symptoms, and understand your body — every single day of the year.

🌙 What We Do
We help women understand, predict, and optimize their menstrual health through AI-driven tracking, personalized insights, mood analysis, and beautifully designed health reports.

✨ Why sync365?
• AI-Powered Insights — Get personalized recommendations based on your unique cycle patterns
• Smart Health Reports — Professional PDF reports with symptom analysis, mood trends, and predictions
• Private & Secure — Your health data stays yours. Always encrypted, never sold
• Designed for You — A premium, thoughtfully designed experience that makes daily tracking effortless

🚀 Our Mission
To empower every woman with the knowledge and tools to take control of her health, naturally and confidently — 365 days a year.

📱 Available on iOS & Android
🌐 Learn more at sync365.app`,
          note: "Full company description",
          multiline: true,
        },
      ],
    },
    {
      section: "Contact & Links",
      icon: <Globe className="w-5 h-5" />,
      items: [
        { label: "Website", value: "https://sync365.app", note: "Primary website URL" },
        { label: "Phone", value: "(Optional) Add if you have a business line", note: "" },
        { label: "Location", value: "Add your city, country", note: "Headquarters location" },
      ],
    },
    {
      section: "Specialties / Hashtags",
      icon: <Hash className="w-5 h-5" />,
      items: [
        {
          label: "Specialties (comma-separated)",
          value: "Period Tracking, Women's Health, AI Health Insights, Menstrual Health, Wellness Technology, Cycle Analysis, Health Reports, FemTech, Reproductive Health, Mobile Health Apps",
          note: "Up to 20 specialties",
        },
      ],
    },
    {
      section: "First Post (Copy & Paste)",
      icon: <MessageSquare className="w-5 h-5" />,
      items: [
        {
          label: "Launch Announcement Post",
          value: `🌙 Introducing sync365 — Your Cycle. Your Power. Your Wellness.

We're thrilled to announce sync365, an AI-powered period and wellness tracking platform designed to help women understand and optimize their health — every day of the year.

✨ What makes sync365 different?

🔮 AI-driven cycle predictions & personalized insights
📊 Professional health reports you can share with your doctor
🛡️ Privacy-first — your data is encrypted and never sold
🎨 A beautifully designed experience that makes tracking effortless

Whether you're tracking symptoms, understanding mood patterns, or planning ahead — sync365 gives you the tools to take control.

📱 Available on iOS & Android
🌐 Learn more → sync365.app

#FemTech #WomensHealth #PeriodTracking #HealthTech #AI #Wellness #sync365 #MenstrualHealth #DigitalHealth`,
          note: "Ready-to-post LinkedIn announcement",
          multiline: true,
        },
      ],
    },
  ];

  const checklist = [
    "Create LinkedIn Company Page at linkedin.com/pages/creation",
    "Upload the banner image (download below)",
    "Upload your company logo (square, 300×300px recommended)",
    "Fill in Company Name & Tagline",
    "Write the About section (copy from below)",
    "Add Industry, Company Size, and Type",
    "Add Website URL and Location",
    "Add Specialties",
    "Publish your first post (copy from below)",
    "Invite your connections to follow the page",
    "Add yourself as an admin with a personal headline mentioning sync365",
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="gradient-nebula py-16 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <Badge variant="outline" className="mb-4 border-primary/40 text-primary">
            LinkedIn Setup Guide
          </Badge>
          <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-3">
            sync365 <span className="text-gradient-rose">LinkedIn</span> Page
          </h1>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Everything you need to create a professional LinkedIn company page — banner, copy, and launch post all ready to go.
          </p>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-12 space-y-10">
        {/* Banner Download */}
        <Card className="border-primary/20 overflow-hidden">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-xl">
              <Download className="w-5 h-5 text-primary" />
              LinkedIn Banner (1584 × 512)
            </CardTitle>
            <p className="text-xs text-muted-foreground mt-1">
              💡 Tip: Download this background and add the "sync365" text in Canva or Figma using DM Sans Bold to match your brand font.
            </p>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="rounded-lg overflow-hidden border border-border">
              <img
                src="/linkedin-banner.png"
                alt="sync365 LinkedIn Banner"
                className="w-full h-auto"
              />
            </div>
            <div className="flex gap-3">
              <a href="/linkedin-banner.png" download="sync365-LinkedIn-Banner.png" className="flex-1">
                <Button className="w-full gap-2">
                  <Download className="w-4 h-4" />
                  Download Banner
                </Button>
              </a>
              <a href="/sync365-logo.png" download="sync365-logo.png" className="flex-1">
                <Button variant="outline" className="w-full gap-2">
                  <Download className="w-4 h-4" />
                  Download App Logo
                </Button>
              </a>
            </div>
          </CardContent>
        </Card>

        {/* LinkedIn Logo Download */}
        <Card className="border-primary/20 overflow-hidden">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-xl">
              <Download className="w-5 h-5 text-primary" />
              LinkedIn Profile Logo (1024 × 1024)
            </CardTitle>
            <p className="text-xs text-muted-foreground mt-1">
              Use this as your LinkedIn company page profile picture. High resolution, optimized for square crop.
            </p>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="rounded-lg overflow-hidden border border-border flex justify-center bg-muted/20 p-8">
              <img
                src="/sync365-linkedin-logo.png"
                alt="sync365 LinkedIn Logo"
                className="w-64 h-64 object-contain rounded-full"
              />
            </div>
            <a href="/sync365-linkedin-logo.png" download="sync365-linkedin-logo.png">
              <Button className="w-full gap-2">
                <Download className="w-4 h-4" />
                Download LinkedIn Logo
              </Button>
            </a>
          </CardContent>
        </Card>

        {/* Checklist */}
        <Card className="border-accent/20">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-xl">
              <CheckCircle2 className="w-5 h-5 text-accent" />
              Setup Checklist
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ol className="space-y-3">
              {checklist.map((item, i) => (
                <li key={i} className="flex items-start gap-3 text-sm text-foreground/90">
                  <span className="flex-shrink-0 w-6 h-6 rounded-full bg-accent/10 text-accent flex items-center justify-center text-xs font-semibold">
                    {i + 1}
                  </span>
                  {item}
                </li>
              ))}
            </ol>
            <Separator className="my-4" />
            <a
              href="https://www.linkedin.com/company/setup/new/"
              target="_blank"
              rel="noopener noreferrer"
            >
              <Button variant="outline" className="w-full gap-2">
                <ExternalLink className="w-4 h-4" />
                Create LinkedIn Company Page
              </Button>
            </a>
          </CardContent>
        </Card>

        {/* Content Fields */}
        {fields.map((section) => (
          <Card key={section.section} className="border-border/50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-xl">
                {section.icon}
                {section.section}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-5">
              {section.items.map((item) => (
                <div key={item.label} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="text-sm font-medium text-foreground">{item.label}</label>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-7 text-xs gap-1"
                      onClick={() => copyToClipboard(item.value, item.label)}
                    >
                      {copiedField === item.label ? (
                        <><CheckCircle2 className="w-3 h-3 text-accent" /> Copied</>
                      ) : (
                        <><Copy className="w-3 h-3" /> Copy</>
                      )}
                    </Button>
                  </div>
                  {item.note && (
                    <p className="text-xs text-muted-foreground">{item.note}</p>
                  )}
                  <div
                    className={`rounded-lg border border-border bg-muted/30 p-3 text-sm text-foreground/90 whitespace-pre-wrap ${
                      (item as any).multiline ? "max-h-60 overflow-y-auto" : ""
                    }`}
                  >
                    {item.value}
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default LinkedInSetup;
