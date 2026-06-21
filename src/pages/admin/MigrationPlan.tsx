import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import architectureDiagram from '@/assets/migration-architecture.png';
import {
  ArrowLeft, Cloud, Database, Server, Globe, Mail, Shield,
  Workflow, CheckCircle2, AlertTriangle, GitBranch, Layers, Zap,
  Smartphone, Monitor, KeyRound, Bell, HardDrive, Activity, Network, Lock, CreditCard
} from 'lucide-react';

/**
 * Hybrid Migration Solution Design
 * KEEP on Supabase (Lovable Cloud): Database + Edge Functions + Auth
 * MOVE to AWS: Frontend hosting, DNS/CDN, Email, Monitoring, CI/CD, Secrets store
 */
export default function MigrationPlan() {
  return (
    <>
    <style>{`
      .migration-light, .migration-light * { color: #000 !important; }
      .migration-light .text-muted-foreground { color: #000 !important; }
      .migration-light .text-foreground { color: #000 !important; }
      .migration-light [class*="bg-card"] { background-color: #ffffff !important; }
      .migration-light [class*="border-border"] { border-color: #e2e8f0 !important; }
      .migration-light header { background-color: rgba(255,255,255,0.95) !important; }
      /* Force all tinted inner panels to plain white with black text */
      .migration-light [class*="bg-primary/"],
      .migration-light [class*="bg-secondary/"],
      .migration-light [class*="bg-accent/"],
      .migration-light [class*="bg-background/"],
      .migration-light [class*="bg-muted"],
      .migration-light [class*="from-primary/"],
      .migration-light [class*="to-secondary/"] {
        background-color: #ffffff !important;
        background-image: none !important;
        border-color: #e2e8f0 !important;
      }
      .migration-light table thead { background-color: #f1f5f9 !important; }
      .migration-light code { color: #0f172a !important; background: #f1f5f9; padding: 1px 4px; border-radius: 4px; }
      .migration-light .text-primary,
      .migration-light .text-secondary,
      .migration-light .text-accent,
      .migration-light .text-destructive { color: #0f172a !important; }
      .migration-light table, .migration-light th, .migration-light td { color: #000 !important; background-color: #fff !important; border-color: #e2e8f0 !important; }
      .migration-light .text-muted-foreground { color: #000 !important; }
    `}</style>
    <div className="min-h-screen bg-white migration-light">
      <header className="border-b border-border/50 bg-card/50 backdrop-blur-lg sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link to="/admin">
              <Button variant="ghost" size="sm">
                <ArrowLeft className="w-4 h-4 mr-2" /> Admin
              </Button>
            </Link>
            <h1 className="font-heading text-xl text-foreground flex items-center gap-2">
              <Cloud className="w-5 h-5 text-secondary" /> Hybrid Migration Plan
            </h1>
          </div>
          <Badge variant="outline" className="border-secondary/40 text-secondary">
            v4 · Hybrid AWS + Supabase
          </Badge>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 space-y-8 max-w-6xl">
        {/* Strategy */}
        <Card className="p-6 bg-card/60 border-border/50">
          <h2 className="font-heading text-2xl mb-3 flex items-center gap-2">
            <Workflow className="w-6 h-6 text-primary" /> Strategy at a Glance
          </h2>
          <p className="text-muted-foreground mb-4">
            Keep all <strong>data &amp; backend logic</strong> on Supabase (zero schema migration risk).
            Move <strong>presentation, delivery, email and ops</strong> to AWS for scale, control and
            cost optimization. Single DNS cutover, fully reversible.
          </p>
          <div className="grid md:grid-cols-2 gap-4">
            <div className="p-4 rounded-lg border border-primary/30 bg-primary/5">
              <p className="text-xs uppercase tracking-wider text-primary mb-2">Stays on Supabase</p>
              <ul className="text-sm space-y-1 text-foreground/90">
                <li>• Lovable Cloud DB (profiles, user_roles, waitlist, content_pages, pricing, analytics)</li>
                <li>• Rork master DB (users, subscriptions, orders, codes, transactions)</li>
                <li>• 24 Edge Functions (Stripe, redeem, billing, webhooks, archive)</li>
                <li>• Supabase Auth (email/password + Google SSO)</li>
                <li>• Storage buckets &amp; RLS policies</li>
              </ul>
            </div>
            <div className="p-4 rounded-lg border border-secondary/30 bg-secondary/5">
              <p className="text-xs uppercase tracking-wider text-secondary mb-2">Moves to AWS</p>
              <ul className="text-sm space-y-1 text-foreground/90">
                <li>• Frontend hosting → S3 + CloudFront</li>
                <li>• DNS → Route 53 (sync365.app)</li>
                <li>• TLS → ACM certificates</li>
                <li>• Email delivery → SES (already partly there)</li>
                <li>• Logs &amp; uptime → CloudWatch + SNS alerts</li>
                <li>• CI/CD → CodePipeline / GitHub Actions → S3</li>
                <li>• WAF + Shield for sync365.app</li>
              </ul>
            </div>
          </div>
        </Card>

        {/* Visual Solution Design Diagram */}
        <Card className="p-6 bg-card/60 border-border/50">
          <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
            <h2 className="font-heading text-2xl flex items-center gap-2">
              <Network className="w-6 h-6 text-primary" /> Visual Solution Design
            </h2>
            <Badge variant="outline">Solution Design v1.0</Badge>
          </div>
          <p className="text-muted-foreground mb-4 text-sm">
            End-to-end target architecture: Mobile, Marketing site and Admin web app served via AWS edge,
            with Supabase as the data plane and 3rd-party services for payments, AI and analytics.
          </p>
          <div className="rounded-xl overflow-hidden border border-border/40 bg-[#0b1020]">
            <img
              src={architectureDiagram}
              alt="sync365 Hybrid AWS + Supabase Architecture diagram showing clients, AWS edge & API, AWS application services, Supabase data plane, and 3rd party integrations"
              loading="lazy"
              width={1920}
              height={1280}
              className="w-full h-auto"
            />
          </div>

          {/* DNS + Move matrix */}
          <div className="grid md:grid-cols-2 gap-4 mt-6">
            <div className="p-4 rounded-lg border border-border/50 bg-background/40">
              <h3 className="font-heading text-lg mb-2 flex items-center gap-2">
                <Globe className="w-4 h-4" /> DNS Mapping (Route 53)
              </h3>
              <ul className="text-sm space-y-1 font-mono">
                <li><code>app.sync365.app</code> → API Gateway (mobile)</li>
                <li><code>www.sync365.app</code> → CloudFront → S3 (marketing)</li>
                <li><code>admin.sync365.app</code> → Amplify (admin SPA)</li>
                <li><code>api.sync365.app</code> → API Gateway (webhooks, ops)</li>
              </ul>
            </div>
            <div className="p-4 rounded-lg border border-border/50 bg-background/40">
              <h3 className="font-heading text-lg mb-2 flex items-center gap-2">
                <Lock className="w-4 h-4" /> Security Controls
              </h3>
              <ul className="text-sm space-y-1">
                <li>• Supabase Auth for users · Cognito + MFA for staff</li>
                <li>• Least-privilege IAM per Lambda, no long-lived keys</li>
                <li>• Postgres RLS on every user-scoped table</li>
                <li>• S3 private + SSE-KMS, signed URLs</li>
                <li>• WAF managed rules, rate limiting, ACM TLS 1.2+, HSTS</li>
                <li>• Secrets Manager + KMS CMKs with auto-rotation</li>
              </ul>
            </div>
          </div>

          {/* What Moves Where */}
          <div className="mt-6">
            <h3 className="font-heading text-lg mb-2 flex items-center gap-2">
              <GitBranch className="w-4 h-4" /> What Moves Where
            </h3>
            <div className="overflow-x-auto rounded-lg border border-border/50">
              <table className="w-full text-sm">
                <thead className="bg-background/60">
                  <tr className="text-left">
                    <th className="p-2">Workload</th><th className="p-2">Today</th><th className="p-2">Target</th>
                  </tr>
                </thead>
                <tbody>
                  {[
                    ['App database', 'Supabase', 'Supabase (PITR + S3 backup)'],
                    ['App user auth', 'Supabase Auth', 'Supabase'],
                    ['Edge functions / AI', 'Supabase', 'Supabase'],
                    ['Marketing website', '—', 'AWS S3 + CloudFront'],
                    ['Admin dashboard', '—', 'AWS Amplify + Cognito'],
                    ['Transactional email', '—', 'AWS SES'],
                    ['Stripe webhooks', '—', 'AWS API GW + Lambda'],
                    ['RevenueCat webhooks', '—', 'AWS API GW + Lambda'],
                    ['Schedules / digests', '—', 'AWS EventBridge + Lambda'],
                    ['Secrets', '.env', 'AWS Secrets Manager'],
                    ['Observability', 'Mixed', 'CloudWatch + Sentry'],
                    ['Mobile app', 'Expo', 'Unchanged'],
                  ].map(([w, t, tgt]) => (
                    <tr key={w} className="border-t border-border/40">
                      <td className="p-2 font-medium">{w}</td>
                      <td className="p-2 text-muted-foreground">{t}</td>
                      <td className="p-2">{tgt}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Key Data Flows */}
          <div className="grid md:grid-cols-2 gap-4 mt-6">
            <div className="p-4 rounded-lg border border-primary/30 bg-primary/5">
              <p className="text-xs uppercase tracking-wider text-primary mb-1">App → Data</p>
              <p className="text-sm">Mobile app authenticates with Supabase Auth, reads/writes Postgres directly with RLS, calls Edge Functions for AI.</p>
            </div>
            <div className="p-4 rounded-lg border border-secondary/30 bg-secondary/5">
              <p className="text-xs uppercase tracking-wider text-secondary mb-1">Stripe / RevenueCat → Entitlements</p>
              <p className="text-sm">Webhook → CloudFront → API Gateway → Lambda (verifies signature) → Supabase entitlement table via service key from Secrets Manager.</p>
            </div>
            <div className="p-4 rounded-lg border border-accent/30 bg-accent/5">
              <p className="text-xs uppercase tracking-wider text-accent mb-1">Email Lifecycle</p>
              <p className="text-sm">EventBridge cron / Supabase trigger → SQS → Lambda renders template → SES sends → bounce/complaint topic → CloudWatch alarm.</p>
            </div>
            <div className="p-4 rounded-lg border border-border bg-background/40">
              <p className="text-xs uppercase tracking-wider text-muted-foreground mb-1">Admin Dashboard</p>
              <p className="text-sm">Staff sign in to Cognito (MFA) → Amplify SPA → API Gateway (Cognito authorizer) → Lambda → read-only Supabase views + ops actions.</p>
            </div>
          </div>
        </Card>

        {/* Architecture diagram (ASCII-style blocks) */}
        <Card className="p-6 bg-card/60 border-border/50">
          <h2 className="font-heading text-2xl mb-4 flex items-center gap-2">
            <Layers className="w-6 h-6 text-primary" /> Solution Blocks
          </h2>

          <div className="space-y-4">
            {/* Block: User */}
            <Block icon={<Globe />} title="1. User / Browser" color="primary">
              Visitor lands on <code className="text-primary">https://sync365.app</code> from any region.
            </Block>

            <Arrow label="HTTPS request" />

            {/* Block: AWS Edge */}
            <Block icon={<Shield />} title="2. AWS Edge Layer" color="secondary">
              <ul className="text-sm space-y-1">
                <li>• <strong>Route 53</strong> — DNS for sync365.app, latency-based routing</li>
                <li>• <strong>CloudFront</strong> — Global CDN, caches static assets at 400+ POPs</li>
                <li>• <strong>ACM</strong> — Free TLS certificate, auto-renewed</li>
                <li>• <strong>AWS WAF</strong> — Bot/SQLi/XSS protection, rate limiting</li>
              </ul>
            </Block>

            <Arrow label="Static asset request" />

            {/* Block: Frontend */}
            <Block icon={<Server />} title="3. Frontend Hosting (AWS S3)" color="accent">
              <ul className="text-sm space-y-1">
                <li>• React 18 SPA built with Vite → static files in <code>s3://sync365-app-prod</code></li>
                <li>• Versioned deploys, instant rollback</li>
                <li>• CloudFront origin, no public S3 access</li>
                <li>• Build env: <code>VITE_SUPABASE_URL</code>, <code>VITE_SUPABASE_PUBLISHABLE_KEY</code> (unchanged)</li>
              </ul>
            </Block>

            <Arrow label="API + Auth calls (HTTPS)" />

            {/* Block: Supabase backend */}
            <Block icon={<Database />} title="4. Supabase Backend (UNCHANGED)" color="primary">
              <div className="grid md:grid-cols-3 gap-3 text-sm">
                <div className="p-3 rounded bg-background/40 border border-border/40">
                  <p className="font-semibold text-primary mb-1">Auth</p>
                  Email + Google SSO. JWT validation in edge functions.
                </div>
                <div className="p-3 rounded bg-background/40 border border-border/40">
                  <p className="font-semibold text-primary mb-1">PostgreSQL</p>
                  Lovable Cloud DB + Rork master DB (external project).
                </div>
                <div className="p-3 rounded bg-background/40 border border-border/40">
                  <p className="font-semibold text-primary mb-1">Edge Functions (24)</p>
                  Stripe, redeem-code, archive, billing-account, etc.
                </div>
              </div>
            </Block>

            <Arrow label="Triggers" />

            {/* Block: AWS services */}
            <Block icon={<Mail />} title="5. AWS Services (called from edge functions)" color="secondary">
              <ul className="text-sm space-y-1">
                <li>• <strong>SES</strong> — Transactional email (welcome, redemption, refund, suspension)</li>
                <li>• <strong>S3 (assets)</strong> — User uploads, exports, branded PDFs to <code>/mnt/documents</code></li>
                <li>• <strong>CloudWatch Logs</strong> — Mirror of edge function logs via Logflare → CloudWatch</li>
                <li>• <strong>SNS</strong> — P0/P1 alert fan-out (email + SMS to on-call)</li>
              </ul>
            </Block>

            <Arrow label="External" dashed />

            <Block icon={<Zap />} title="6. Third-party (unchanged)" color="accent">
              Stripe (subscriptions + webhooks → Supabase edge function), Google OAuth, Mixpanel.
            </Block>
          </div>
        </Card>

        {/* Migration milestones */}
        <Card className="p-6 bg-card/60 border-border/50">
          <h2 className="font-heading text-2xl mb-4 flex items-center gap-2">
            <GitBranch className="w-6 h-6 text-primary" /> Migration Milestones
          </h2>
          <div className="space-y-3">
            {milestones.map((m, i) => (
              <div key={i} className="p-4 rounded-lg border border-border/40 bg-background/30">
                <div className="flex items-start justify-between gap-4 mb-2">
                  <h3 className="font-semibold text-foreground">
                    M{i + 1} — {m.title}
                  </h3>
                  <Badge variant="outline" className="shrink-0">{m.duration}</Badge>
                </div>
                <p className="text-sm text-muted-foreground mb-2">{m.scope}</p>
                <p className="text-xs text-primary"><strong>Acceptance:</strong> {m.acceptance}</p>
              </div>
            ))}
          </div>
        </Card>

        {/* Cutover & rollback */}
        <div className="grid md:grid-cols-2 gap-4">
          <Card className="p-6 bg-card/60 border-border/50">
            <h3 className="font-heading text-xl mb-3 flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-primary" /> Zero-downtime Cutover
            </h3>
            <ol className="text-sm space-y-2 text-foreground/90 list-decimal list-inside">
              <li>Deploy SPA to S3 + CloudFront on staging domain</li>
              <li>Smoke-test all 20 routes against live Supabase</li>
              <li>Lower DNS TTL to 60s (24h prior)</li>
              <li>Switch sync365.app A/AAAA to CloudFront</li>
              <li>Monitor CloudWatch + Supabase logs for 30 min</li>
              <li>Restore TTL to 3600s after 24h stability</li>
            </ol>
          </Card>
          <Card className="p-6 bg-card/60 border-border/50">
            <h3 className="font-heading text-xl mb-3 flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-destructive" /> Rollback Plan
            </h3>
            <ul className="text-sm space-y-2 text-foreground/90">
              <li>• DNS revert to Lovable hosting (≤60s with low TTL)</li>
              <li>• No data migration → no data loss possible</li>
              <li>• Stripe webhook URL untouched (still hits Supabase)</li>
              <li>• Decision threshold: &gt;1% 5xx or P0 incident</li>
              <li>• Owner: Tech lead, with admin sign-off</li>
            </ul>
          </Card>
        </div>

        {/* Why this works */}
        <Card className="p-6 bg-gradient-to-br from-primary/10 to-secondary/10 border-primary/30">
          <h3 className="font-heading text-xl mb-3">Why Hybrid Beats Full-AWS</h3>
          <div className="grid md:grid-cols-3 gap-4 text-sm">
            <div>
              <p className="font-semibold text-primary mb-1">Lower risk</p>
              No DB migration, no auth rewrite, no edge function port. ~70% less code change.
            </div>
            <div>
              <p className="font-semibold text-primary mb-1">Faster delivery</p>
              2–3 weeks vs 8–12 weeks for a full AWS rebuild.
            </div>
            <div>
              <p className="font-semibold text-primary mb-1">Future-ready</p>
              Frontend already on AWS — RDS/Lambda port can happen later, function-by-function.
            </div>
          </div>
        </Card>

        {/* ============================================================ */}
        {/* FULL APP ARCHITECTURE — merged from Solution Design v1.0     */}
        {/* ============================================================ */}
        <Card className="p-6 bg-card/60 border-border/50">
          <div className="flex items-center justify-between mb-2 flex-wrap gap-2">
            <h2 className="font-heading text-2xl flex items-center gap-2">
              <Network className="w-6 h-6 text-primary" /> Full App Architecture (Solution Design v1.0)
            </h2>
            <div className="flex gap-2">
              <Badge className="bg-orange-500/15 text-orange-400 border border-orange-500/40">AWS</Badge>
              <Badge className="bg-emerald-500/15 text-emerald-400 border border-emerald-500/40">Supabase</Badge>
              <Badge className="bg-blue-500/15 text-blue-400 border border-blue-500/40">3rd Party</Badge>
            </div>
          </div>
          <p className="text-sm text-muted-foreground mb-6">
            Web frontend, marketing site, email and ops on AWS. Application database, auth and Edge Functions
            remain on Supabase. Mobile app (Rork / React Native) talks to both.
          </p>

          {/* Layered architecture */}
          <div className="space-y-3">
            <Layer title="Clients" tone="accent">
              <Tile icon={<Smartphone className="w-4 h-4" />} title="Mobile App" sub="Expo / React Native · App Store · Play Store" tag="ext" />
              <Tile icon={<Globe className="w-4 h-4" />} title="Marketing Website" sub="Static · CloudFront + S3" tag="aws" />
              <Tile icon={<Monitor className="w-4 h-4" />} title="Admin / Web App" sub="Operator dashboard · Amplify Hosting" tag="aws" />
            </Layer>

            <Arrow label="HTTPS" />

            <Layer title="AWS — Edge & API" tone="secondary">
              <Tile icon={<Shield className="w-4 h-4" />} title="CloudFront (CDN)" sub="WAF · ACM TLS · Shield" tag="aws" />
              <Tile icon={<Network className="w-4 h-4" />} title="API Gateway" sub="REST · HTTPS · Cognito JWT" tag="aws" />
              <Tile icon={<Zap className="w-4 h-4" />} title="Lambda (Node/TS)" sub="webhooks · email · reports · ops" tag="aws" />
            </Layer>

            <Arrow label="invokes" />

            <Layer title="AWS — Application Services" tone="secondary">
              <Tile icon={<Mail className="w-4 h-4" />} title="SES" sub="Transactional email" tag="aws" />
              <Tile icon={<HardDrive className="w-4 h-4" />} title="S3" sub="Assets · exports · backups" tag="aws" />
              <Tile icon={<Activity className="w-4 h-4" />} title="EventBridge" sub="Schedules · async events" tag="aws" />
              <Tile icon={<Bell className="w-4 h-4" />} title="SQS / SNS" sub="Queues · fan-out" tag="aws" />
              <Tile icon={<KeyRound className="w-4 h-4" />} title="Cognito" sub="Admin/web SSO · MFA" tag="aws" />
              <Tile icon={<Lock className="w-4 h-4" />} title="Secrets Mgr / KMS" sub="Keys · rotation" tag="aws" />
              <Tile icon={<Activity className="w-4 h-4" />} title="CloudWatch" sub="Logs · metrics · alarms" tag="aws" />
              <Tile icon={<Globe className="w-4 h-4" />} title="Route 53" sub="DNS" tag="aws" />
            </Layer>

            <Arrow label="data + auth" />

            <Layer title="Supabase — Data Plane (kept)" tone="primary">
              <Tile icon={<Database className="w-4 h-4" />} title="Postgres" sub="RLS · pgvector · PITR backups" tag="supa" />
              <Tile icon={<KeyRound className="w-4 h-4" />} title="Supabase Auth" sub="App users · JWT" tag="supa" />
              <Tile icon={<Server className="w-4 h-4" />} title="Edge Functions" sub="AI · realtime triggers · Stripe" tag="supa" />
              <Tile icon={<HardDrive className="w-4 h-4" />} title="Storage" sub="User-generated media" tag="supa" />
            </Layer>

            <Arrow label="external" dashed />

            <Layer title="3rd Party Integrations" tone="accent">
              <Tile icon={<CreditCard className="w-4 h-4" />} title="Stripe" sub="Payments · webhooks" tag="ext" />
              <Tile icon={<CreditCard className="w-4 h-4" />} title="RevenueCat" sub="iOS/Android subscriptions" tag="ext" />
              <Tile icon={<Zap className="w-4 h-4" />} title="OpenAI / LLM" sub="AI features" tag="ext" />
              <Tile icon={<Activity className="w-4 h-4" />} title="Mixpanel" sub="Product analytics" tag="ext" />
              <Tile icon={<Bell className="w-4 h-4" />} title="Sentry · APNs · FCM" sub="Crash · push" tag="ext" />
            </Layer>
          </div>
        </Card>

        {/* What moves where */}
        <Card className="p-6 bg-card/60 border-border/50">
          <h2 className="font-heading text-2xl mb-4 flex items-center gap-2">
            <ArrowLeft className="w-6 h-6 text-primary rotate-180" /> What Moves Where
          </h2>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-xs uppercase tracking-wider text-muted-foreground border-b border-border/50">
                  <th className="text-left py-2 pr-3">Workload</th>
                  <th className="text-left py-2 pr-3">Today</th>
                  <th className="text-left py-2 pr-3">Target</th>
                  <th className="text-left py-2">Notes</th>
                </tr>
              </thead>
              <tbody>
                {moveMatrix.map((r, i) => (
                  <tr key={i} className="border-b border-border/30 last:border-0">
                    <td className="py-2 pr-3 font-medium text-foreground">{r.workload}</td>
                    <td className="py-2 pr-3 text-muted-foreground">{r.today}</td>
                    <td className="py-2 pr-3 text-primary">{r.target}</td>
                    <td className="py-2 text-muted-foreground">{r.notes}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>

        {/* Key data flows */}
        <Card className="p-6 bg-card/60 border-border/50">
          <h2 className="font-heading text-2xl mb-4 flex items-center gap-2">
            <Workflow className="w-6 h-6 text-primary" /> Key Data Flows
          </h2>
          <div className="grid md:grid-cols-2 gap-3">
            {dataFlows.map((f, i) => (
              <div key={i} className="p-4 rounded-lg border border-border/40 bg-background/30">
                <p className="font-semibold text-foreground mb-1">{f.title}</p>
                <p className="text-sm text-muted-foreground">{f.body}</p>
              </div>
            ))}
          </div>
        </Card>

        {/* Environments + DNS */}
        <div className="grid md:grid-cols-2 gap-4">
          <Card className="p-6 bg-card/60 border-border/50">
            <h3 className="font-heading text-xl mb-3">Environments</h3>
            <ul className="text-sm space-y-2 text-foreground/90">
              <li><strong className="text-primary">dev</strong> — isolated AWS account, Supabase dev project, sandbox Stripe + RevenueCat.</li>
              <li><strong className="text-primary">staging</strong> — mirror of prod for release candidates and E2E tests.</li>
              <li><strong className="text-primary">prod</strong> — hardened account, WAF + Shield, daily PITR, paging on alarms.</li>
            </ul>
          </Card>
          <Card className="p-6 bg-card/60 border-border/50">
            <h3 className="font-heading text-xl mb-3">DNS (Route 53)</h3>
            <ul className="text-sm space-y-1 text-foreground/90 font-mono">
              <li>app.sync365.app → API Gateway (mobile API)</li>
              <li>www.sync365.app → CloudFront → S3 (marketing)</li>
              <li>admin.sync365.app → Amplify (admin)</li>
              <li>api.sync365.app → API Gateway (webhooks, ops)</li>
            </ul>
          </Card>
        </div>

        {/* Security controls */}
        <Card className="p-6 bg-card/60 border-border/50">
          <h2 className="font-heading text-2xl mb-4 flex items-center gap-2">
            <Lock className="w-6 h-6 text-primary" /> Security Controls
          </h2>
          <div className="grid md:grid-cols-2 gap-3">
            {securityControls.map((s, i) => (
              <div key={i} className="p-4 rounded-lg border border-border/40 bg-background/30">
                <p className="font-semibold text-foreground mb-2">{s.title}</p>
                <ul className="text-sm text-muted-foreground space-y-1 list-disc list-inside">
                  {s.points.map((p, j) => <li key={j}>{p}</li>)}
                </ul>
              </div>
            ))}
          </div>
        </Card>

        {/* Migration phases */}
        <Card className="p-6 bg-card/60 border-border/50">
          <h2 className="font-heading text-2xl mb-4 flex items-center gap-2">
            <GitBranch className="w-6 h-6 text-primary" /> Migration Phases (Solution Design)
          </h2>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-xs uppercase tracking-wider text-muted-foreground border-b border-border/50">
                  <th className="text-left py-2 pr-3">Phase</th>
                  <th className="text-left py-2 pr-3">Scope</th>
                  <th className="text-left py-2">Exit Criteria</th>
                </tr>
              </thead>
              <tbody>
                {phases.map((p, i) => (
                  <tr key={i} className="border-b border-border/30 last:border-0">
                    <td className="py-2 pr-3 font-medium text-primary whitespace-nowrap">{p.phase}</td>
                    <td className="py-2 pr-3 text-foreground/90">{p.scope}</td>
                    <td className="py-2 text-muted-foreground">{p.exit}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>

        {/* Risks */}
        <Card className="p-6 bg-card/60 border-border/50">
          <h2 className="font-heading text-2xl mb-4 flex items-center gap-2">
            <AlertTriangle className="w-6 h-6 text-destructive" /> Risks &amp; Mitigations
          </h2>
          <div className="grid md:grid-cols-2 gap-3">
            {risks.map((r, i) => (
              <div key={i} className="p-4 rounded-lg border border-border/40 bg-background/30">
                <p className="font-semibold text-foreground mb-1">{r.title}</p>
                <p className="text-sm text-muted-foreground">{r.body}</p>
              </div>
            ))}
          </div>
        </Card>

        <p className="text-xs text-muted-foreground text-center">
          Reference baseline: all Rork + Lovable web features live as of 02/05/2026 · Solution Design v1.0
        </p>
      </main>
    </div>
    </>
  );
}

function Layer({ title, tone, children }: { title: string; tone: 'primary' | 'secondary' | 'accent'; children: React.ReactNode }) {
  const toneMap = {
    primary: 'border-primary/40 bg-primary/5',
    secondary: 'border-secondary/40 bg-secondary/5',
    accent: 'border-accent/40 bg-accent/5',
  };
  return (
    <div className={`p-4 rounded-lg border ${toneMap[tone]}`}>
      <p className="text-xs uppercase tracking-wider text-muted-foreground mb-3">{title}</p>
      <div className="grid sm:grid-cols-2 md:grid-cols-4 gap-2">{children}</div>
    </div>
  );
}

function Tile({ icon, title, sub, tag }: { icon: React.ReactNode; title: string; sub: string; tag: 'aws' | 'supa' | 'ext' }) {
  const tagMap = {
    aws: 'bg-orange-500/15 text-orange-400 border-orange-500/40',
    supa: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/40',
    ext: 'bg-blue-500/15 text-blue-400 border-blue-500/40',
  };
  return (
    <div className="p-3 rounded-md border border-border/40 bg-background/40">
      <div className="flex items-center justify-between mb-1">
        <div className="flex items-center gap-1.5 text-foreground text-sm font-medium">{icon}{title}</div>
        <span className={`text-[10px] px-1.5 py-0.5 rounded border uppercase font-bold ${tagMap[tag]}`}>{tag}</span>
      </div>
      <p className="text-xs text-muted-foreground leading-snug">{sub}</p>
    </div>
  );
}

const moveMatrix = [
  { workload: 'App database', today: 'Supabase', target: 'Supabase', notes: 'No change. Enable PITR + cross-region backup to S3.' },
  { workload: 'App user auth', today: 'Supabase Auth', target: 'Supabase', notes: 'JWT validated by API Gateway authorizer when needed.' },
  { workload: 'Edge functions / AI', today: 'Supabase', target: 'Supabase', notes: 'Stay close to data; called from app and from Lambda.' },
  { workload: 'Marketing website', today: 'Lovable hosting', target: 'S3 + CloudFront', notes: 'Static export, ACM cert, WAF.' },
  { workload: 'Admin dashboard', today: 'Lovable hosting', target: 'Amplify + Cognito', notes: 'Staff-only, MFA enforced.' },
  { workload: 'Transactional email', today: 'Mixed', target: 'SES', notes: 'Templates managed in code; sends via Lambda.' },
  { workload: 'Stripe webhooks', today: 'Supabase function', target: 'API GW + Lambda', notes: 'Idempotent writes to Supabase via service role.' },
  { workload: 'RevenueCat webhooks', today: '—', target: 'API GW + Lambda', notes: 'Updates entitlement table in Supabase.' },
  { workload: 'Schedules / digests', today: 'pg_cron', target: 'EventBridge + Lambda', notes: 'Daily/weekly jobs.' },
  { workload: 'Secrets', today: '.env / Supabase', target: 'Secrets Manager', notes: 'Rotated; injected into Lambda at runtime.' },
  { workload: 'Observability', today: 'Mixed', target: 'CloudWatch + Sentry', notes: 'Single pane for AWS; Sentry for client crashes.' },
  { workload: 'Mobile app', today: 'Expo', target: 'Unchanged', notes: 'Talks to Supabase + AWS API Gateway.' },
];

const dataFlows = [
  { title: 'App → Data', body: 'Mobile app authenticates with Supabase Auth, reads/writes Postgres directly with RLS, and invokes Supabase Edge Functions for AI features.' },
  { title: 'Stripe / RevenueCat → Entitlements', body: 'Provider posts webhook → CloudFront → API Gateway → Lambda verifies signature → writes entitlement row in Supabase via service key (in Secrets Manager).' },
  { title: 'Email Lifecycle', body: 'EventBridge cron / Supabase trigger → SQS → Lambda renders template → SES sends → bounce/complaint topic → CloudWatch alarm.' },
  { title: 'Admin Dashboard', body: 'Staff sign in to Cognito (MFA) → Amplify-hosted SPA → API Gateway (Cognito authorizer) → Lambda → read-only views of Supabase + ops actions.' },
];

const securityControls = [
  { title: 'Identity', points: ['Supabase Auth for end users; Cognito for staff with MFA.', 'Least-privilege IAM roles per Lambda; no long-lived keys.'] },
  { title: 'Data', points: ['Postgres RLS enforced for every user-scoped table.', 'S3 buckets private + SSE-KMS; signed URLs for downloads.', 'Daily PITR snapshots replicated to S3 (cross-region).'] },
  { title: 'Edge', points: ['WAF managed rule sets, rate limiting, geo controls.', 'ACM TLS 1.2+; HSTS on web origins.'] },
  { title: 'Secrets', points: ['Secrets Manager with KMS CMKs; auto-rotation where supported.', 'No secrets in client bundles or repo.'] },
];

const phases = [
  { phase: '0 — Foundation', scope: 'AWS Org, accounts, Route 53, KMS, Secrets Manager, CI/CD (GitHub Actions → AWS OIDC).', exit: 'IaC (Terraform/CDK) deploys an empty stack to dev/staging/prod.' },
  { phase: '1 — Web & Email', scope: 'Marketing site on S3+CloudFront; SES domain verified; transactional templates.', exit: 'Live www domain, first email delivered, DMARC pass.' },
  { phase: '2 — API & Webhooks', scope: 'API Gateway + Lambda; Stripe & RevenueCat webhooks; Secrets wired.', exit: 'End-to-end test purchase updates Supabase entitlement.' },
  { phase: '3 — Admin & Ops', scope: 'Cognito, Amplify admin dashboard, EventBridge schedules, CloudWatch alarms.', exit: 'Staff can sign in; daily digest job runs in prod.' },
  { phase: '4 — Hardening', scope: 'WAF rules, load test, DR drill, runbooks.', exit: 'RTO ≤ 1h, RPO ≤ 15m demonstrated.' },
];

const risks = [
  { title: 'Cross-cloud latency', body: 'Lambdas in same region as Supabase project; cache reads in CloudFront where safe.' },
  { title: 'Secret sprawl', body: 'Single source: AWS Secrets Manager; Supabase uses Vault for its own keys only.' },
  { title: 'Webhook replay / loss', body: 'API Gateway → SQS → Lambda with idempotency keys and DLQ.' },
  { title: 'Email deliverability', body: 'Warm SES domain, monitor bounces < 5%, complaints < 0.1%.' },
];

function Block({
  icon, title, children, color,
}: { icon: React.ReactNode; title: string; children: React.ReactNode; color: 'primary' | 'secondary' | 'accent' }) {
  const colorMap = {
    primary: 'border-primary/40 bg-primary/5',
    secondary: 'border-secondary/40 bg-secondary/5',
    accent: 'border-accent/40 bg-accent/5',
  };
  return (
    <div className={`p-4 rounded-lg border ${colorMap[color]}`}>
      <div className="flex items-center gap-2 mb-2 text-foreground font-semibold">
        <span className={`text-${color}`}>{icon}</span>
        {title}
      </div>
      <div className="text-foreground/85 pl-7">{children}</div>
    </div>
  );
}

function Arrow({ label, dashed }: { label: string; dashed?: boolean }) {
  return (
    <div className="flex items-center justify-center gap-2 text-xs text-muted-foreground">
      <div className={`w-px h-6 ${dashed ? 'border-l border-dashed border-muted-foreground/40' : 'bg-muted-foreground/40'}`} />
      <span className="italic">↓ {label}</span>
    </div>
  );
}

const milestones = [
  {
    title: 'AWS Foundation',
    duration: '3 days',
    scope: 'Create AWS account/OU, IAM roles, Route 53 hosted zone, ACM cert for sync365.app, S3 bucket, CloudFront distribution, WAF web ACL.',
    acceptance: 'Staging URL serves a placeholder page over HTTPS via CloudFront.',
  },
  {
    title: 'Frontend Build & Deploy Pipeline',
    duration: '3 days',
    scope: 'GitHub Actions workflow: build Vite SPA → upload to S3 → invalidate CloudFront. Env vars for Supabase URL/key injected at build.',
    acceptance: 'Push to main auto-deploys; staging shows live app talking to Supabase.',
  },
  {
    title: 'Email via SES (verified)',
    duration: '2 days',
    scope: 'Move out of SES sandbox, verify sync365.app domain (DKIM + SPF + DMARC), confirm send-notification-email + send-waitlist-email use production SES.',
    acceptance: 'Test sends to 5 external inboxes land in inbox (not spam) for all 5 templates.',
  },
  {
    title: 'Observability & Alerts',
    duration: '2 days',
    scope: 'CloudWatch dashboard, SNS topic for P0/P1, uptime checks on /, /pricing, /dashboard, /admin. Pipe Supabase function logs via Logflare → CloudWatch.',
    acceptance: 'Synthetic 5xx triggers SNS email/SMS within 2 min.',
  },
  {
    title: 'Security Hardening',
    duration: '2 days',
    scope: 'WAF rules (rate limit, OWASP top 10), GuardDuty, S3 bucket policy locked to CloudFront OAC, secrets audit, security headers via CloudFront response policy.',
    acceptance: 'OWASP ZAP baseline scan passes; pentest checklist signed off.',
  },
  {
    title: 'Production Cutover',
    duration: '1 day + 30-day stability',
    scope: 'Lower TTL → DNS switch sync365.app → CloudFront → monitor → restore TTL. Stripe untouched, Supabase untouched.',
    acceptance: '30 consecutive days zero P0; daily Stripe↔DB reconciliation clean.',
  },
  {
    title: 'Handover & Support',
    duration: '10 months',
    scope: 'Runbooks, IAM access transfer, on-call rotation, monthly review. Optional later: port edge functions to Lambda, DB to RDS.',
    acceptance: 'Client team can deploy, rollback, and read logs unaided.',
  },
];
