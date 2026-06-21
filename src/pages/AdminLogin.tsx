import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { Shield, Loader2, Moon } from 'lucide-react';
import { z } from 'zod';
import { trackFailedLogin } from '@/lib/track-security';

const emailSchema = z.string().email('Invalid email address');
const passwordSchema = z.string().min(6, 'Password must be at least 6 characters');

export default function AdminLogin() {
  const [isLoading, setIsLoading] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState<{ email?: string; password?: string }>({});
  
  const { signIn, user, isAdmin, loading } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    if (!loading && user && isAdmin) {
      navigate('/admin');
    }
  }, [user, isAdmin, loading, navigate]);

  const validateForm = () => {
    const newErrors: { email?: string; password?: string } = {};
    
    try {
      emailSchema.parse(email);
    } catch (e) {
      if (e instanceof z.ZodError) {
        newErrors.email = e.errors[0].message;
      }
    }
    
    try {
      passwordSchema.parse(password);
    } catch (e) {
      if (e instanceof z.ZodError) {
        newErrors.password = e.errors[0].message;
      }
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;
    
    setIsLoading(true);
    const { error } = await signIn(email, password);
    
    if (error) {
      trackFailedLogin(email, '/admin/login');
      setIsLoading(false);
      toast({
        title: 'Sign in failed',
        description: error.message === 'Invalid login credentials' 
          ? 'Invalid email or password.'
          : error.message,
        variant: 'destructive',
      });
      return;
    }

    // Wait a moment for the auth state to update and check admin status
    setTimeout(async () => {
      setIsLoading(false);
      // The useEffect will handle navigation if user becomes admin
    }, 1000);
  };

  if (loading) {
    return (
      <div className="min-h-screen gradient-nebula flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen gradient-nebula flex items-center justify-center p-4">
      <Card className="w-full max-w-md glass border-border/50">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <div className="w-16 h-16 rounded-full bg-secondary/20 border border-secondary/50 flex items-center justify-center">
              <Shield className="w-8 h-8 text-secondary" />
            </div>
          </div>
          <div className="flex items-center justify-center gap-2 mb-2">
            <div className="w-8 h-8 rounded-full gradient-rose-gold flex items-center justify-center">
              <span className="font-heading text-lg font-bold text-primary-foreground">f</span>
            </div>
            <span className="font-heading text-xl text-foreground">sync365</span>
          </div>
          <CardTitle className="font-heading text-2xl text-foreground">Admin Login</CardTitle>
          <CardDescription className="text-muted-foreground">
            Sign in with your admin credentials
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSignIn} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email" className="text-foreground">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="admin@sync365.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="bg-muted/50 border-border focus:border-secondary"
                required
              />
              {errors.email && <p className="text-sm text-destructive">{errors.email}</p>}
            </div>
            <div className="space-y-2">
              <Label htmlFor="password" className="text-foreground">Password</Label>
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="bg-muted/50 border-border focus:border-secondary"
                required
              />
              {errors.password && <p className="text-sm text-destructive">{errors.password}</p>}
            </div>
            <Button 
              type="submit" 
              className="w-full bg-secondary hover:bg-secondary/90 text-secondary-foreground" 
              disabled={isLoading}
            >
              {isLoading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Shield className="w-4 h-4 mr-2" />}
              Admin Sign In
            </Button>
          </form>
          
          <div className="mt-6 text-center">
            <a href="/" className="text-sm text-muted-foreground hover:text-primary transition-colors">
              ← Back to main site
            </a>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
