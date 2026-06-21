import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Mail, Clock, AlertCircle } from 'lucide-react';
import { useState, useRef, useEffect } from 'react';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';

const contactSchema = z.object({
  email: z.string().trim().email({ message: "Please enter a valid email address" }).max(255, { message: "Email must be less than 255 characters" }),
  message: z.string().trim()
    .min(10, { message: "Message must be at least 10 characters" })
    .max(500, { message: "Message must be less than 500 characters" })
    .refine((val) => val.split('\n').length <= 3, { message: "Message must be 3 lines or less" })
});

export default function ContactPage() {
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [honeypot, setHoneypot] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<{ email?: string; message?: string }>({});
  const formStartTime = useRef<number>(Date.now());

  useEffect(() => {
    formStartTime.current = Date.now();
  }, []);

  const handleMessageChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const value = e.target.value;
    const lines = value.split('\n');
    if (lines.length <= 3 && value.length <= 500) {
      setMessage(value);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Bot detection: honeypot check
    if (honeypot) {
      toast.success("Message sent successfully!");
      return;
    }

    // Bot detection: time check (minimum 3 seconds)
    const timeTaken = Date.now() - formStartTime.current;
    if (timeTaken < 3000) {
      toast.success("Message sent successfully!");
      return;
    }

    setErrors({});
    
    const result = contactSchema.safeParse({ email, message });
    
    if (!result.success) {
      const fieldErrors: { email?: string; message?: string } = {};
      result.error.errors.forEach((err) => {
        if (err.path[0] === 'email') fieldErrors.email = err.message;
        if (err.path[0] === 'message') fieldErrors.message = err.message;
      });
      setErrors(fieldErrors);
      return;
    }

    setIsSubmitting(true);
    
    // Simulate submission (in production, this would go to an edge function)
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    toast.success("Message received! We'll respond within 30+ days.");
    setEmail('');
    setMessage('');
    formStartTime.current = Date.now();
    setIsSubmitting(false);
  };

  return (
    <div className="min-h-screen gradient-nebula">
      <Header />
      
      <main className="pt-32 pb-20">
        {/* Hero */}
        <section className="container max-w-4xl mx-auto px-4 text-center mb-12">
          <Badge className="mb-6 bg-primary/20 text-primary border-primary/30">
            Contact Us
          </Badge>
          <h1 className="text-4xl md:text-5xl font-heading mb-6 text-gradient-cosmic">
            Get in Touch
          </h1>
          <p className="text-lg text-foreground/90 max-w-2xl mx-auto">
            We'd love to hear from you. Please note our current response times due to high demand.
          </p>
        </section>

        {/* Important Notice */}
        <section className="container max-w-2xl mx-auto px-4 mb-12">
          <Card className="glass border-amber-500/30 bg-amber-500/5">
            <CardContent className="p-6">
              <div className="flex items-start gap-4">
                <AlertCircle className="w-6 h-6 text-amber-500 flex-shrink-0 mt-0.5" />
                <div>
                  <h3 className="font-semibold text-foreground mb-2">Important Response Time Notice</h3>
                  <p className="text-foreground/90 text-sm">
                    Due to our current member queue and limited support capacity, please expect a response time of <strong className="text-foreground">30+ days</strong>. We appreciate your patience and will respond to every inquiry in the order received.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </section>

        {/* Contact Form */}
        <section className="container max-w-2xl mx-auto px-4">
          <Card className="glass border-border/50">
            <CardHeader>
              <div className="flex items-center gap-3 mb-2">
                <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center">
                  <Mail className="w-5 h-5 text-primary" />
                </div>
                <CardTitle className="font-heading">Send us a Message</CardTitle>
              </div>
              <CardDescription className="text-foreground/90">
                Email-only contact. Maximum 3 lines, 500 characters.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                {/* Honeypot field - hidden from users */}
                <input
                  type="text"
                  name="website"
                  value={honeypot}
                  onChange={(e) => setHoneypot(e.target.value)}
                  className="absolute -left-[9999px] opacity-0 pointer-events-none"
                  tabIndex={-1}
                  autoComplete="off"
                />
                
                <div>
                  <Input
                    type="email"
                    placeholder="Your email address"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className={`bg-background/50 border-border/50 ${errors.email ? 'border-destructive' : ''}`}
                    disabled={isSubmitting}
                  />
                  {errors.email && (
                    <p className="text-destructive text-xs mt-1">{errors.email}</p>
                  )}
                </div>
                
                <div>
                  <Textarea
                    placeholder="Your message (max 3 lines, 500 characters)"
                    value={message}
                    onChange={handleMessageChange}
                    rows={3}
                    className={`bg-background/50 border-border/50 resize-none ${errors.message ? 'border-destructive' : ''}`}
                    disabled={isSubmitting}
                  />
                  <div className="flex justify-between mt-1">
                    {errors.message ? (
                      <p className="text-destructive text-xs">{errors.message}</p>
                    ) : (
                      <span />
                    )}
                    <span className="text-xs text-foreground/90">
                      {message.length}/500 � {message.split('\n').length}/3 lines
                    </span>
                  </div>
                </div>
                
                <Button
                  type="submit"
                  className="w-full btn-cosmic"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? 'Sending...' : 'Send Message'}
                </Button>
              </form>
              
              <div className="mt-6 pt-4 border-t border-border/30">
                <div className="flex items-center gap-2 text-xs text-foreground/90">
                  <Clock className="w-3 h-3" />
                  <span>Expected response: 30+ days</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </section>
      </main>

      <Footer />
    </div>
  );
}
