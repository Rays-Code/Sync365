import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { Activity, Loader2 } from 'lucide-react';
import { z } from 'zod';
import { trackAuthFailure, processSignup } from '@/services/supabaseFunctions';

const emailSchema = z.string().email('Invalid email address');
const passwordSchema = z.string().min(6, 'Password must be at least 6 characters');

export default function Auth() {
  const [isLoading, setIsLoading] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState<{ email?: string; password?: string }>({});
  
  const { signIn, signUp, signInWithGoogle, user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    if (user) {
      navigate('/dashboard');
    }
  }, [user, navigate]);

  const validateForm = () => {
    const newErrors: { email?: string; password?: string } = {};
    try { emailSchema.parse(email); } catch (e) {
      if (e instanceof z.ZodError) newErrors.email = e.errors[0].message;
    }
    try { passwordSchema.parse(password); } catch (e) {
      if (e instanceof z.ZodError) newErrors.password = e.errors[0].message;
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;
    setIsLoading(true);
    const { error } = await signIn(email, password);
    setIsLoading(false);
    if (error) {
      toast({
        title: 'Sign in failed',
        description: error.message,
        variant: 'destructive',
      });
      // Track failed auth attempt via edge function
      trackAuthFailure(email, 'signin_failed').catch(() => {});
    } else {
      navigate('/dashboard');
    }
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;
    setIsLoading(true);
    const { data, error } = await signUp(email, password);
    setIsLoading(false);
    if (error) {
      toast({
        title: 'Sign up failed',
        description: error.message,
        variant: 'destructive',
      });
    } else {
      // Trigger post-signup edge function (profile encryption, etc.)
      if (data?.user?.id) {
        processSignup(data.user.id, email).catch(() => {});
      }
      toast({
        title: 'Check your email',
        description: 'We sent you a confirmation link. Please verify your email to sign in.',
      });
    }
  };

  const handleGoogleSignIn = async () => {
    setIsGoogleLoading(true);
    const { error } = await signInWithGoogle();
    setIsGoogleLoading(false);
    if (error) {
      toast({
        title: 'Google sign-in failed',
        description: error.message,
        variant: 'destructive',
      });
    }
  };

  return (
    <div className="min-h-screen gradient-nebula flex items-center justify-center p-4">
      <Card className="w-full max-w-md glass border-border/50">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <div className="w-16 h-16 rounded-full bg-gradient-to-r from-[#D43D51] to-[#9333EA] flex items-center justify-center shadow-lg glow-primary">
              <Activity className="w-8 h-8 text-white" />
            </div>
          </div>
          <CardTitle className="font-heading text-3xl text-gradient-rose">sync365</CardTitle>
          <CardDescription className="text-muted-foreground">
            Sign in to your account or create a new one
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Tabs defaultValue="signin" className="w-full">
            <TabsList className="grid w-full grid-cols-2 bg-muted/50">
              <TabsTrigger value="signin">Sign In</TabsTrigger>
              <TabsTrigger value="signup">Sign Up</TabsTrigger>
            </TabsList>
            
            <TabsContent value="signin">
              <form onSubmit={handleSignIn} className="space-y-4 mt-4">
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input id="email" type="email" placeholder="your@email.com" value={email}
                    onChange={(e) => setEmail(e.target.value)} className="bg-muted/50 border-border" required />
                  {errors.email && <p className="text-sm text-destructive">{errors.email}</p>}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="password">Password</Label>
                  <Input id="password" type="password" placeholder="••••••••" value={password}
                    onChange={(e) => setPassword(e.target.value)} className="bg-muted/50 border-border" required />
                  {errors.password && <p className="text-sm text-destructive">{errors.password}</p>}
                </div>
                <Button type="submit" className="w-full btn-cosmic" disabled={isLoading}>
                  {isLoading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                  Sign In
                </Button>
              </form>
              <div className="relative my-4">
                <div className="absolute inset-0 flex items-center">
                  <span className="w-full border-t border-border/50" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-card px-2 text-muted-foreground">Or continue with</span>
                </div>
              </div>
              <Button
                id="google-signin-btn"
                type="button"
                variant="outline"
                className="w-full border-border/50 bg-muted/30 hover:bg-muted/60"
                onClick={handleGoogleSignIn}
                disabled={isGoogleLoading}
              >
                {isGoogleLoading ? (
                  <Loader2 className="w-4 h-4 animate-spin mr-2" />
                ) : (
                  <svg className="w-4 h-4 mr-2" viewBox="0 0 24 24">
                    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05"/>
                    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                  </svg>
                )}
                Continue with Google
              </Button>
            </TabsContent>
            
            <TabsContent value="signup">
              <form onSubmit={handleSignUp} className="space-y-4 mt-4">
                <div className="space-y-2">
                  <Label htmlFor="signupEmail">Email</Label>
                  <Input id="signupEmail" type="email" placeholder="your@email.com" value={email}
                    onChange={(e) => setEmail(e.target.value)} className="bg-muted/50 border-border" required />
                  {errors.email && <p className="text-sm text-destructive">{errors.email}</p>}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="signupPassword">Password</Label>
                  <Input id="signupPassword" type="password" placeholder="••••••••" value={password}
                    onChange={(e) => setPassword(e.target.value)} className="bg-muted/50 border-border" required />
                  {errors.password && <p className="text-sm text-destructive">{errors.password}</p>}
                </div>
                <Button type="submit" className="w-full btn-cosmic" disabled={isLoading}>
                  {isLoading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                  Create Account
                </Button>
              </form>
              <div className="relative my-4">
                <div className="absolute inset-0 flex items-center">
                  <span className="w-full border-t border-border/50" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-card px-2 text-muted-foreground">Or continue with</span>
                </div>
              </div>
              <Button
                id="google-signup-btn"
                type="button"
                variant="outline"
                className="w-full border-border/50 bg-muted/30 hover:bg-muted/60"
                onClick={handleGoogleSignIn}
                disabled={isGoogleLoading}
              >
                {isGoogleLoading ? (
                  <Loader2 className="w-4 h-4 animate-spin mr-2" />
                ) : (
                  <svg className="w-4 h-4 mr-2" viewBox="0 0 24 24">
                    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05"/>
                    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                  </svg>
                )}
                Continue with Google
              </Button>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}
