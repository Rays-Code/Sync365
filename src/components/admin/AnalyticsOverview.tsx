import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  Eye, Users, Globe, Monitor, Smartphone, Tablet,
  ShieldAlert, AlertTriangle, TrendingUp, Clock, MapPin, Link2,
  Share2, Copy, Check
} from "lucide-react";
import { toast } from "sonner";

interface VisitStats {
  totalVisits: number;
  uniqueVisitors: number;
  todayVisits: number;
  topPages: { page_path: string; count: number }[];
  topReferrers: { referrer: string; count: number }[];
  topUtmSources: { source: string; count: number }[];
  deviceBreakdown: { device_type: string; count: number }[];
  browserBreakdown: { browser: string; count: number }[];
  osBreakdown: { os: string; count: number }[];
  countryBreakdown: { country: string; count: number }[];
  recentVisits: any[];
}

interface SecurityStats {
  totalEvents: number;
  criticalEvents: number;
  recentEvents: any[];
}

function getSecurityEventDescription(event: any): { title: string; explanation: string; action: string | null } {
  const details = event.details || {};
  const type = event.event_type || "";

  switch (type) {
    case "failed_login":
      return {
        title: "Failed Login Attempt",
        explanation: `Someone tried to log in${details.email_attempted ? ` as "${details.email_attempted}"` : ""} and failed. ${
          details.recent_failures_15min
            ? `There have been ${details.recent_failures_15min} failed attempt(s) from this IP in the last 15 minutes.`
            : ""
        }`,
        action: details.recent_failures_15min && details.recent_failures_15min >= 3
          ? "Monitor this IP closely. Consider blocking if attempts continue."
          : null,
      };
    case "brute_force_detected":
      return {
        title: "🚨 Brute Force Attack Detected",
        explanation: `${details.attempts || "Multiple"} failed login attempts detected from the same IP in 15 minutes. This is a strong indicator of an automated attack attempting to guess credentials.`,
        action: "Immediately review this IP. Consider implementing IP blocking and ensure strong passwords are in use.",
      };
    case "suspicious_ip":
      return {
        title: "Suspicious IP Activity",
        explanation: `This IP made ${details.visit_count_5min || "an unusually high number of"} page requests in 5 minutes. This could be a bot, scraper, or potential DDoS attempt.`,
        action: details.visit_count_5min && details.visit_count_5min > 100
          ? "High traffic volume — consider rate limiting or blocking this IP."
          : "Monitor for continued unusual activity.",
      };
    case "test_event":
      return {
        title: "Test Event",
        explanation: "This is a test security event generated during system setup. It can be safely ignored.",
        action: null,
      };
    default:
      return {
        title: type.replace(/_/g, " ").replace(/\b\w/g, (c: string) => c.toUpperCase()),
        explanation: details.message || `A "${type}" security event was recorded.${
          details.email_attempted ? ` Email: ${details.email_attempted}.` : ""
        }`,
        action: event.severity === "critical" || event.severity === "high"
          ? "Investigate this event immediately."
          : null,
      };
  }
}

export default function AnalyticsOverview() {
  const [visitStats, setVisitStats] = useState<VisitStats | null>(null);
  const [securityStats, setSecurityStats] = useState<SecurityStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState<"24h" | "7d" | "30d">("7d");
  
  // Link generator state
  const [linkPlatform, setLinkPlatform] = useState("linkedin");
  const [linkCampaign, setLinkCampaign] = useState("");
  const [linkPage, setLinkPage] = useState("/");
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    fetchData();
  }, [timeRange]);

  const getStartDate = () => {
    const now = new Date();
    if (timeRange === "24h") now.setHours(now.getHours() - 24);
    else if (timeRange === "7d") now.setDate(now.getDate() - 7);
    else now.setDate(now.getDate() - 30);
    return now.toISOString();
  };

  const fetchData = async () => {
    setLoading(true);
    const startDate = getStartDate();
    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);

    const { data: sessionData } = await supabase.auth.getSession();
    const authHeaders = sessionData.session ? {
      Authorization: `Bearer ${sessionData.session.access_token}`,
    } : {};

    // Fetch visits via Supabase edge function
    const { data: visitsResponse } = await supabase.functions.invoke("external-db-query", {
      body: { table: "site_visits", limit: 1000, orderColumn: "created_at", orderAsc: false },
      headers: authHeaders,
    });
    const allVisits = visitsResponse?.data || [];
    // Filter by date range client-side
    const visits = allVisits.filter((v: any) => v.created_at >= startDate);
    const todayVisitsCount = allVisits.filter((v: any) => v.created_at >= todayStart.toISOString()).length;

    // Fetch security events via Supabase edge function
    const { data: secResponse } = await supabase.functions.invoke("external-db-query", {
      body: { table: "security_events", limit: 100 },
      headers: authHeaders,
    });
    const secEvents = (secResponse?.data || []).filter((e: any) => e.created_at >= startDate);

    if (visits) {
      const uniqueIPs = new Set(visits.map((v: any) => v.ip_hash));

      // Aggregate top pages
      const pageMap: Record<string, number> = {};
      visits.forEach((v: any) => {
        pageMap[v.page_path] = (pageMap[v.page_path] || 0) + 1;
      });
      const topPages = Object.entries(pageMap)
        .map(([page_path, count]) => ({ page_path, count }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 10);

      // Aggregate referrers — filter out self-referrals
      const selfDomains = ["sync365.app", "localhost"];
      const refMap: Record<string, number> = {};
      visits.filter((v: any) => v.referrer).forEach((v: any) => {
        try {
          const host = new URL(v.referrer).hostname;
          if (selfDomains.some(d => host.includes(d))) return;
          refMap[host] = (refMap[host] || 0) + 1;
        } catch {
          refMap[v.referrer] = (refMap[v.referrer] || 0) + 1;
        }
      });
      const topReferrers = Object.entries(refMap)
        .map(([referrer, count]) => ({ referrer, count }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 10);

      // Aggregate UTM sources
      const utmMap: Record<string, number> = {};
      visits.filter((v: any) => v.utm_source).forEach((v: any) => {
        const label = v.utm_medium 
          ? `${v.utm_source} / ${v.utm_medium}` 
          : v.utm_source;
        utmMap[label] = (utmMap[label] || 0) + 1;
      });
      const topUtmSources = Object.entries(utmMap)
        .map(([source, count]) => ({ source, count }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 10);

      // Device breakdown
      const devMap: Record<string, number> = {};
      visits.forEach((v: any) => {
        devMap[v.device_type || "unknown"] = (devMap[v.device_type || "unknown"] || 0) + 1;
      });
      const deviceBreakdown = Object.entries(devMap)
        .map(([device_type, count]) => ({ device_type, count }))
        .sort((a, b) => b.count - a.count);

      // Browser breakdown
      const brMap: Record<string, number> = {};
      visits.forEach((v: any) => {
        brMap[v.browser || "Unknown"] = (brMap[v.browser || "Unknown"] || 0) + 1;
      });
      const browserBreakdown = Object.entries(brMap)
        .map(([browser, count]) => ({ browser, count }))
        .sort((a, b) => b.count - a.count);

      // OS breakdown
      const osMap: Record<string, number> = {};
      visits.forEach((v: any) => {
        osMap[v.os || "Unknown"] = (osMap[v.os || "Unknown"] || 0) + 1;
      });
      const osBreakdown = Object.entries(osMap)
        .map(([os, count]) => ({ os, count }))
        .sort((a, b) => b.count - a.count);

      // Country breakdown
      const countryMap: Record<string, number> = {};
      visits.filter((v: any) => v.country).forEach((v: any) => {
        countryMap[v.country] = (countryMap[v.country] || 0) + 1;
      });
      const countryBreakdown = Object.entries(countryMap)
        .map(([country, count]) => ({ country, count }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 10);

      setVisitStats({
        totalVisits: visits.length,
        uniqueVisitors: uniqueIPs.size,
        todayVisits: todayVisitsCount,
        topPages,
        topReferrers,
        topUtmSources,
        deviceBreakdown,
        browserBreakdown,
        osBreakdown,
        countryBreakdown,
        recentVisits: visits.slice(0, 20),
      });
    }

    if (secEvents) {
      // Filter out test events for cleaner display
      const realEvents = secEvents.filter((e: any) => e.event_type !== "test_event");
      setSecurityStats({
        totalEvents: realEvents.length,
        criticalEvents: realEvents.filter((e: any) => e.severity === "critical" || e.severity === "high").length,
        recentEvents: realEvents.slice(0, 20),
      });
    }

    setLoading(false);
  };

  const DeviceIcon = ({ type }: { type: string }) => {
    if (type === "mobile") return <Smartphone className="w-4 h-4" />;
    if (type === "tablet") return <Tablet className="w-4 h-4" />;
    return <Monitor className="w-4 h-4" />;
  };

  const severityColor = (s: string) => {
    if (s === "critical") return "bg-destructive text-destructive-foreground";
    if (s === "high") return "bg-destructive/70 text-destructive-foreground";
    if (s === "medium") return "bg-primary/60 text-primary-foreground";
    return "bg-muted text-muted-foreground";
  };

  const BarChart = ({ items, labelKey, valueKey, maxItems = 5 }: { items: any[]; labelKey: string; valueKey: string; maxItems?: number }) => {
    const display = items.slice(0, maxItems);
    const max = Math.max(...display.map((i) => i[valueKey]), 1);
    return (
      <div className="space-y-2">
        {display.map((item, idx) => (
          <div key={idx} className="space-y-1">
            <div className="flex justify-between text-xs">
              <span className="text-foreground truncate max-w-[200px]">{item[labelKey] || "Direct"}</span>
              <span className="text-muted-foreground">{item[valueKey]}</span>
            </div>
            <div className="h-2 rounded-full bg-muted overflow-hidden">
              <div
                className="h-full rounded-full gradient-rose-gold transition-all duration-500"
                style={{ width: `${(item[valueKey] / max) * 100}%` }}
              />
            </div>
          </div>
        ))}
        {items.length === 0 && <p className="text-xs text-muted-foreground">No data yet</p>}
      </div>
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin w-6 h-6 border-2 border-primary border-t-transparent rounded-full" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Time Range Selector */}
      <div className="flex items-center gap-2">
        {(["24h", "7d", "30d"] as const).map((range) => (
          <button
            key={range}
            onClick={() => setTimeRange(range)}
            className={`px-3 py-1.5 text-xs rounded-full border transition-all ${
              timeRange === range
                ? "bg-primary text-primary-foreground border-primary"
                : "bg-card border-border text-muted-foreground hover:text-foreground"
            }`}
          >
            {range === "24h" ? "Last 24h" : range === "7d" ? "Last 7 days" : "Last 30 days"}
          </button>
        ))}
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="bg-card/60 border-border/50">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-primary/10">
                <Eye className="w-5 h-5 text-primary" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Total Page Views</p>
                <p className="text-2xl font-heading font-bold text-foreground">{visitStats?.totalVisits || 0}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-card/60 border-border/50">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-accent/10">
                <Users className="w-5 h-5 text-accent" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Unique Visitors</p>
                <p className="text-2xl font-heading font-bold text-foreground">{visitStats?.uniqueVisitors || 0}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-card/60 border-border/50">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-secondary/10">
                <TrendingUp className="w-5 h-5 text-secondary" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Today's Visits</p>
                <p className="text-2xl font-heading font-bold text-foreground">{visitStats?.todayVisits || 0}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className={`border-border/50 ${(securityStats?.criticalEvents || 0) > 0 ? "bg-destructive/10 border-destructive/30" : "bg-card/60"}`}>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className={`p-2 rounded-lg ${(securityStats?.criticalEvents || 0) > 0 ? "bg-destructive/20" : "bg-muted"}`}>
                <ShieldAlert className={`w-5 h-5 ${(securityStats?.criticalEvents || 0) > 0 ? "text-destructive" : "text-muted-foreground"}`} />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Security Alerts</p>
                <p className="text-2xl font-heading font-bold text-foreground">{securityStats?.totalEvents || 0}</p>
                {(securityStats?.criticalEvents || 0) > 0 && (
                  <p className="text-xs text-destructive">{securityStats?.criticalEvents} critical/high</p>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Detailed Breakdown */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {/* Top Pages */}
        <Card className="bg-card/60 border-border/50">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-foreground flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-primary" />
              Top Pages
            </CardTitle>
          </CardHeader>
          <CardContent>
            <BarChart items={visitStats?.topPages || []} labelKey="page_path" valueKey="count" />
          </CardContent>
        </Card>

        {/* Campaign Traffic (UTM) */}
        <Card className="bg-card/60 border-border/50">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-foreground flex items-center gap-2">
              <Share2 className="w-4 h-4 text-accent" />
              Campaign Traffic
            </CardTitle>
            <p className="text-[10px] text-muted-foreground mt-0.5">From tracked links (UTM)</p>
          </CardHeader>
          <CardContent>
            <BarChart items={visitStats?.topUtmSources || []} labelKey="source" valueKey="count" />
          </CardContent>
        </Card>

        {/* Referrer Traffic */}
        <Card className="bg-card/60 border-border/50">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-foreground flex items-center gap-2">
              <Link2 className="w-4 h-4 text-accent" />
              Referrer Traffic
            </CardTitle>
            <p className="text-[10px] text-muted-foreground mt-0.5">Sites linking to you directly</p>
          </CardHeader>
          <CardContent>
            <BarChart items={visitStats?.topReferrers || []} labelKey="referrer" valueKey="count" />
          </CardContent>
        </Card>

        {/* Devices */}
        <Card className="bg-card/60 border-border/50">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-foreground flex items-center gap-2">
              <Monitor className="w-4 h-4 text-secondary" />
              Devices
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {visitStats?.deviceBreakdown.map((d, i) => (
                <div key={i} className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-sm text-foreground">
                    <DeviceIcon type={d.device_type} />
                    <span className="capitalize">{d.device_type}</span>
                  </div>
                  <span className="text-sm text-muted-foreground">{d.count}</span>
                </div>
              ))}
              {(!visitStats?.deviceBreakdown.length) && <p className="text-xs text-muted-foreground">No data yet</p>}
            </div>
          </CardContent>
        </Card>

        {/* Browsers */}
        <Card className="bg-card/60 border-border/50">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-foreground flex items-center gap-2">
              <Globe className="w-4 h-4 text-primary" />
              Browsers
            </CardTitle>
          </CardHeader>
          <CardContent>
            <BarChart items={visitStats?.browserBreakdown || []} labelKey="browser" valueKey="count" />
          </CardContent>
        </Card>

        {/* OS */}
        <Card className="bg-card/60 border-border/50">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-foreground flex items-center gap-2">
              <Monitor className="w-4 h-4 text-accent" />
              Operating Systems
            </CardTitle>
          </CardHeader>
          <CardContent>
            <BarChart items={visitStats?.osBreakdown || []} labelKey="os" valueKey="count" />
          </CardContent>
        </Card>

        {/* Countries */}
        <Card className="bg-card/60 border-border/50">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-foreground flex items-center gap-2">
              <MapPin className="w-4 h-4 text-secondary" />
              Countries
            </CardTitle>
          </CardHeader>
          <CardContent>
            <BarChart items={visitStats?.countryBreakdown || []} labelKey="country" valueKey="count" />
          </CardContent>
        </Card>
      </div>

      {/* Security Events */}
      <Card className="bg-card/60 border-border/50">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-medium text-foreground flex items-center gap-2">
            <ShieldAlert className="w-4 h-4 text-destructive" />
            Security Events
            {(securityStats?.criticalEvents || 0) > 0 && (
              <Badge variant="destructive" className="text-xs ml-2">
                {securityStats?.criticalEvents} critical/high
              </Badge>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {securityStats?.recentEvents.length ? (
            <div className="space-y-3 max-h-[400px] overflow-y-auto">
              {securityStats.recentEvents.map((event: any, i: number) => {
                const desc = getSecurityEventDescription(event);
                const isCritical = event.severity === "critical" || event.severity === "high";
                return (
                  <div key={i} className={`p-4 rounded-lg border ${
                    isCritical 
                      ? "bg-destructive/5 border-destructive/30" 
                      : event.severity === "medium" 
                        ? "bg-primary/5 border-primary/30" 
                        : "bg-muted/30 border-border/30"
                  }`}>
                    <div className="flex items-start gap-3">
                      <div className={`p-1.5 rounded-md mt-0.5 ${
                        isCritical ? "bg-destructive/15" : event.severity === "medium" ? "bg-primary/15" : "bg-muted"
                      }`}>
                        <AlertTriangle className={`w-4 h-4 ${
                          isCritical ? "text-destructive" : event.severity === "medium" ? "text-primary" : "text-muted-foreground"
                        }`} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="text-sm font-semibold text-foreground">
                            {desc.title}
                          </span>
                          <Badge className={`text-[10px] uppercase tracking-wider ${severityColor(event.severity)}`}>
                            {event.severity}
                          </Badge>
                        </div>
                        
                        <p className="text-xs text-foreground/80 mt-1.5 leading-relaxed">
                          {desc.explanation}
                        </p>

                        <div className="flex flex-wrap gap-3 mt-2 text-[11px] text-muted-foreground">
                          {event.ip_hash && (
                            <span className="flex items-center gap-1">
                              <Globe className="w-3 h-3" /> IP: {event.ip_hash.slice(0, 8)}…
                            </span>
                          )}
                          {event.page_path && (
                            <span className="flex items-center gap-1">
                              <Link2 className="w-3 h-3" /> {event.page_path}
                            </span>
                          )}
                          <span className="flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            {new Date(event.created_at).toLocaleString()}
                          </span>
                        </div>

                        {desc.action && (
                          <div className={`mt-2.5 px-3 py-1.5 rounded-md text-[11px] font-medium ${
                            isCritical 
                              ? "bg-destructive/10 text-destructive" 
                              : "bg-primary/10 text-primary"
                          }`}>
                            💡 Recommended: {desc.action}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-8">
              <ShieldAlert className="w-8 h-8 text-accent mx-auto mb-2" />
              <p className="text-sm text-muted-foreground">No security events detected</p>
              <p className="text-xs text-muted-foreground mt-1">System is monitoring for suspicious activity</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Link Generator */}
      <Card className="bg-card/60 border-border/50">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-medium text-foreground flex items-center gap-2">
            <Share2 className="w-4 h-4 text-accent" />
            Tracked Link Generator
          </CardTitle>
          <p className="text-[10px] text-muted-foreground mt-0.5">Create links with UTM tracking for social media sharing</p>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 mb-4">
            <div>
              <label className="text-[11px] text-muted-foreground mb-1 block">Platform</label>
              <Select value={linkPlatform} onValueChange={setLinkPlatform}>
                <SelectTrigger className="h-9 text-xs"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="linkedin">LinkedIn</SelectItem>
                  <SelectItem value="facebook">Facebook</SelectItem>
                  <SelectItem value="tiktok">TikTok</SelectItem>
                  <SelectItem value="twitter">Twitter / X</SelectItem>
                  <SelectItem value="instagram">Instagram</SelectItem>
                  <SelectItem value="whatsapp">WhatsApp</SelectItem>
                  <SelectItem value="email">Email</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-[11px] text-muted-foreground mb-1 block">Page</label>
              <Select value={linkPage} onValueChange={setLinkPage}>
                <SelectTrigger className="h-9 text-xs"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="/">Home</SelectItem>
                  <SelectItem value="/pricing">Pricing</SelectItem>
                  <SelectItem value="/about">About</SelectItem>
                  <SelectItem value="/waitlist">Waitlist</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-[11px] text-muted-foreground mb-1 block">Campaign (optional)</label>
              <Input 
                value={linkCampaign} 
                onChange={(e) => setLinkCampaign(e.target.value)} 
                placeholder="e.g. launch-feb"
                className="h-9 text-xs"
              />
            </div>
            <div className="flex items-end">
              <Button 
                size="sm" 
                className="w-full h-9 text-xs"
                onClick={() => {
                  const base = "https://sync365.app";
                  const params = new URLSearchParams({
                    utm_source: linkPlatform,
                    utm_medium: "social",
                    ...(linkCampaign && { utm_campaign: linkCampaign }),
                  });
                  const url = `${base}${linkPage}?${params.toString()}`;
                  navigator.clipboard.writeText(url);
                  setCopied(true);
                  toast.success("Link copied!");
                  setTimeout(() => setCopied(false), 2000);
                }}
              >
                {copied ? <Check className="w-3 h-3 mr-1" /> : <Copy className="w-3 h-3 mr-1" />}
                {copied ? "Copied!" : "Copy Link"}
              </Button>
            </div>
          </div>
          <div className="bg-muted/30 rounded-md p-2.5 text-[11px] text-muted-foreground break-all font-mono">
            {`https://sync365.app${linkPage}?utm_source=${linkPlatform}&utm_medium=social${linkCampaign ? `&utm_campaign=${linkCampaign}` : ""}`}
          </div>
        </CardContent>
      </Card>

      {/* Recent Visits */}
      <Card className="bg-card/60 border-border/50">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-medium text-foreground flex items-center gap-2">
            <Clock className="w-4 h-4 text-primary" />
            Recent Visits
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr className="border-b border-border/30">
                  <th className="text-left py-2 text-muted-foreground font-medium">Page</th>
                  <th className="text-left py-2 text-muted-foreground font-medium">Device</th>
                  <th className="text-left py-2 text-muted-foreground font-medium">Browser</th>
                  <th className="text-left py-2 text-muted-foreground font-medium">OS</th>
                  <th className="text-left py-2 text-muted-foreground font-medium">Country</th>
                  <th className="text-left py-2 text-muted-foreground font-medium">City</th>
                  <th className="text-left py-2 text-muted-foreground font-medium">Time</th>
                </tr>
              </thead>
              <tbody>
                {visitStats?.recentVisits.map((v: any, i: number) => (
                  <tr key={i} className="border-b border-border/20">
                    <td className="py-2 text-foreground max-w-[150px] truncate">{v.page_path}</td>
                    <td className="py-2 text-muted-foreground capitalize">
                      <div className="flex items-center gap-1">
                        <DeviceIcon type={v.device_type} />
                        {v.device_type}
                      </div>
                    </td>
                    <td className="py-2 text-muted-foreground">{v.browser}</td>
                    <td className="py-2 text-muted-foreground">{v.os}</td>
                    <td className="py-2 text-muted-foreground">{v.country || "—"}</td>
                    <td className="py-2 text-muted-foreground">{v.city || "—"}</td>
                    <td className="py-2 text-muted-foreground whitespace-nowrap">{new Date(v.created_at).toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            {!visitStats?.recentVisits.length && <p className="text-xs text-muted-foreground py-4 text-center">No visits recorded yet</p>}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
