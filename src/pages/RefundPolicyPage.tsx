import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { AlertCircle, CheckCircle2, XCircle, Clock, Mail } from 'lucide-react';

export default function RefundPolicyPage() {
  return (
    <div className="min-h-screen gradient-nebula">
      <Header />
      
      <main className="pt-32 pb-20">
        {/* Hero */}
        <section className="container max-w-4xl mx-auto px-4 text-center mb-12">
          <Badge className="mb-6 bg-primary/20 text-primary border-primary/30">
            Legal
          </Badge>
          <h1 className="text-4xl md:text-5xl font-heading mb-6 text-gradient-cosmic">
            Refund Policy
          </h1>
          <p className="text-lg text-foreground/90 max-w-2xl mx-auto">
            Our refund policy for subscription services, in accordance with Australian Consumer Law.
          </p>
          <p className="text-sm text-foreground/90 mt-4">
            Last updated: January 2025 • ABN 37 679 506 551
          </p>
        </section>

        {/* Key Points Summary */}
        <section className="container max-w-4xl mx-auto px-4 mb-12">
          <Card className="glass border-border/50">
            <CardContent className="p-6">
              <h2 className="text-lg font-heading mb-4 flex items-center gap-2">
                <AlertCircle className="w-5 h-5 text-primary" />
                Summary
              </h2>
              <div className="grid md:grid-cols-2 gap-4 text-sm">
                <div className="flex items-start gap-2">
                  <XCircle className="w-4 h-4 text-destructive flex-shrink-0 mt-0.5" />
                  <span className="text-foreground/80">No refunds for digital subscription services once accessed</span>
                </div>
                <div className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-green-500 flex-shrink-0 mt-0.5" />
                  <span className="text-foreground/80">Cooling-off period applies before first access only</span>
                </div>
                <div className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-green-500 flex-shrink-0 mt-0.5" />
                  <span className="text-foreground/80">Major fault guarantee under ACL applies</span>
                </div>
                <div className="flex items-start gap-2">
                  <Clock className="w-4 h-4 text-amber-500 flex-shrink-0 mt-0.5" />
                  <span className="text-foreground/80">Refund requests processed within 30 business days</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </section>

        {/* Full Policy */}
        <section className="container max-w-4xl mx-auto px-4">
          <div className="prose prose-invert max-w-none space-y-8">
            
            {/* Section 1 */}
            <Card className="glass border-border/50">
              <CardContent className="p-6">
                <h2 className="text-xl font-heading mb-4 text-foreground">1. Scope of This Policy</h2>
                <p className="text-foreground/80 text-sm leading-relaxed">
                  This Refund Policy applies to all subscription services ("Services") provided by sync365.app (ABN 37 679 506 551) 
                  ("we", "us", "our"). By purchasing a subscription, you acknowledge that you have read, understood, and agree 
                  to be bound by this policy. This policy operates in conjunction with, and does not limit, your rights under 
                  the Australian Consumer Law (ACL).
                </p>
              </CardContent>
            </Card>

            {/* Section 2 */}
            <Card className="glass border-border/50">
              <CardContent className="p-6">
                <h2 className="text-xl font-heading mb-4 text-foreground">2. Nature of Digital Services</h2>
                <p className="text-foreground/80 text-sm leading-relaxed mb-4">
                  sync365.app provides digital subscription services that are:
                </p>
                <ul className="list-disc pl-5 space-y-2 text-foreground/80 text-sm">
                  <li>Delivered electronically and accessible immediately upon payment confirmation</li>
                  <li>Consumed upon access (i.e., once you log in and use the service, the service has been supplied)</li>
                  <li>Non-tangible digital products that cannot be "returned" in the traditional sense</li>
                </ul>
                <p className="text-foreground/80 text-sm leading-relaxed mt-4">
                  Under Section 44 of the Australian Consumer Law, consumers do not have an automatic right to cancel or 
                  receive a refund for services that have been fully performed, or digital products once downloaded or accessed.
                </p>
              </CardContent>
            </Card>

            {/* Section 3 */}
            <Card className="glass border-border/50">
              <CardContent className="p-6">
                <h2 className="text-xl font-heading mb-4 text-foreground">3. Refund Eligibility</h2>
                
                <h3 className="text-lg font-medium text-foreground mb-3">3.1 Refunds Are NOT Available When:</h3>
                <ul className="list-disc pl-5 space-y-2 text-foreground/80 text-sm mb-6">
                  <li>You have accessed or used any part of the subscription service</li>
                  <li>The subscription period has commenced and you have logged into your account</li>
                  <li>You simply change your mind after purchasing</li>
                  <li>You did not use the service during your subscription period</li>
                  <li>You found the service does not meet your personal preferences or expectations (where the service functions as described)</li>
                  <li>You purchased on behalf of someone else who decided not to use it</li>
                  <li>Your circumstances changed (e.g., health, lifestyle, preferences)</li>
                </ul>

                <h3 className="text-lg font-medium text-foreground mb-3">3.2 Refunds MAY Be Considered When:</h3>
                <ul className="list-disc pl-5 space-y-2 text-foreground/80 text-sm mb-6">
                  <li>You request cancellation before accessing any part of the service (cooling-off period)</li>
                  <li>There is a major failure under the Australian Consumer Law (see Section 4)</li>
                  <li>You were charged in error due to a technical fault on our systems</li>
                  <li>You were charged after properly cancelling your subscription before the renewal date</li>
                </ul>

                <h3 className="text-lg font-medium text-foreground mb-3">3.3 Cooling-Off Period</h3>
                <p className="text-foreground/80 text-sm leading-relaxed">
                  If you purchase a subscription but have NOT yet logged in or accessed any features of the service, 
                  you may request a full refund within 24 hours of purchase. Once you access the service in any way, 
                  this cooling-off period ends immediately.
                </p>
              </CardContent>
            </Card>

            {/* Section 4 */}
            <Card className="glass border-border/50">
              <CardContent className="p-6">
                <h2 className="text-xl font-heading mb-4 text-foreground">4. Australian Consumer Law Guarantees</h2>
                <p className="text-foreground/80 text-sm leading-relaxed mb-4">
                  Our services come with guarantees that cannot be excluded under the Australian Consumer Law. 
                  You are entitled to remedies for a major failure and compensation for any other reasonably foreseeable 
                  loss or damage.
                </p>
                
                <h3 className="text-lg font-medium text-foreground mb-3">4.1 What Constitutes a Major Failure:</h3>
                <ul className="list-disc pl-5 space-y-2 text-foreground/80 text-sm mb-6">
                  <li>The service is substantially unfit for its common purpose and cannot easily be fixed within a reasonable time</li>
                  <li>The service does not meet a specific purpose you told us about before purchasing, and cannot be remedied</li>
                  <li>The service creates an unsafe situation</li>
                </ul>

                <h3 className="text-lg font-medium text-foreground mb-3">4.2 What Does NOT Constitute a Major Failure:</h3>
                <ul className="list-disc pl-5 space-y-2 text-foreground/80 text-sm">
                  <li>Temporary service outages or maintenance (we aim for 99.5% uptime but do not guarantee uninterrupted access)</li>
                  <li>Minor bugs that do not materially affect your use of the core service</li>
                  <li>Features that work as described but do not meet your personal expectations</li>
                  <li>Third-party integrations or app store issues outside our control</li>
                  <li>Issues caused by your device, internet connection, or failure to update the app</li>
                </ul>
              </CardContent>
            </Card>

            {/* Section 5 */}
            <Card className="glass border-border/50">
              <CardContent className="p-6">
                <h2 className="text-xl font-heading mb-4 text-foreground">5. Subscription Cancellation</h2>
                <p className="text-foreground/80 text-sm leading-relaxed mb-4">
                  Cancelling your subscription is different from requesting a refund:
                </p>
                <ul className="list-disc pl-5 space-y-2 text-foreground/80 text-sm">
                  <li><strong>Cancellation:</strong> Stops future billing. You retain access until your current period ends.</li>
                  <li><strong>Refund:</strong> Returns payment for the current period (only available under limited circumstances above).</li>
                </ul>
                <p className="text-foreground/80 text-sm leading-relaxed mt-4">
                  You may cancel your subscription at any time through your account settings or the app store where you purchased. 
                  Cancellation takes effect at the end of your current billing period.
                </p>
              </CardContent>
            </Card>

            {/* Section 6 */}
            <Card className="glass border-border/50">
              <CardContent className="p-6">
                <h2 className="text-xl font-heading mb-4 text-foreground">6. How to Request a Refund</h2>
                <p className="text-foreground/80 text-sm leading-relaxed mb-4">
                  If you believe you are entitled to a refund under this policy:
                </p>
                <ol className="list-decimal pl-5 space-y-2 text-foreground/80 text-sm mb-4">
                  <li>Contact us via the Contact page on our website</li>
                  <li>Provide your registered email address and purchase details</li>
                  <li>Clearly state the reason for your refund request with supporting evidence</li>
                  <li>Allow up to 30 business days for our review and response</li>
                </ol>
                <p className="text-foreground/80 text-sm leading-relaxed">
                  If your subscription was purchased through Apple App Store or Google Play Store, you may need to 
                  request a refund directly through the respective platform, as they process payments independently.
                </p>
              </CardContent>
            </Card>

            {/* Section 7 */}
            <Card className="glass border-border/50">
              <CardContent className="p-6">
                <h2 className="text-xl font-heading mb-4 text-foreground">7. Processing Time</h2>
                <p className="text-foreground/80 text-sm leading-relaxed">
                  Approved refunds will be processed within 30 business days and returned to the original payment method. 
                  Bank processing times may add an additional 5-10 business days. We do not provide refunds via alternative 
                  payment methods.
                </p>
              </CardContent>
            </Card>

            {/* Section 8 */}
            <Card className="glass border-border/50">
              <CardContent className="p-6">
                <h2 className="text-xl font-heading mb-4 text-foreground">8. Disputes</h2>
                <p className="text-foreground/80 text-sm leading-relaxed">
                  If you are not satisfied with our response to your refund request, you may escalate the matter to your 
                  state or territory's consumer protection agency or the Australian Competition and Consumer Commission (ACCC). 
                  We encourage customers to contact us first so we can attempt to resolve any issues directly.
                </p>
              </CardContent>
            </Card>

            {/* Section 9 */}
            <Card className="glass border-border/50">
              <CardContent className="p-6">
                <h2 className="text-xl font-heading mb-4 text-foreground">9. Modifications to This Policy</h2>
                <p className="text-foreground/80 text-sm leading-relaxed">
                  We reserve the right to modify this Refund Policy at any time. Changes will be posted on this page with 
                  an updated revision date. Your continued use of our services after changes constitutes acceptance of the 
                  new policy. Material changes will be communicated via email to active subscribers.
                </p>
              </CardContent>
            </Card>

            {/* Contact */}
            <Card className="glass border-primary/30 bg-primary/5">
              <CardContent className="p-6">
                <div className="flex items-start gap-4">
                  <Mail className="w-6 h-6 text-primary flex-shrink-0 mt-0.5" />
                  <div>
                    <h3 className="font-heading text-lg text-foreground mb-2">Questions About This Policy?</h3>
                    <p className="text-foreground/90 text-sm">
                      If you have questions about this Refund Policy, please contact us through our Contact page. 
                      Please allow 30+ business days for a response due to our current member queue.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
