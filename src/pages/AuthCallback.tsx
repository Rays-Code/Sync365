import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Loader2, Activity } from 'lucide-react';

export default function AuthCallback() {
  const navigate = useNavigate();
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const handleCallback = async () => {
      const hashParams = new URLSearchParams(window.location.hash.replace(/^#/, ''));
      const errorDesc = hashParams.get('error_description');
      if (errorDesc) {
        setError(decodeURIComponent(errorDesc));
        return;
      }

      const { data, error } = await supabase.auth.getSession();
      if (error) {
        setError(error.message);
        return;
      }

      if (data.session) {
        navigate('/dashboard', { replace: true });
      } else {
        navigate('/auth', { replace: true });
      }
    };

    handleCallback();
  }, [navigate]);

  if (error) {
    return (
      <div className="min-h-screen gradient-nebula flex items-center justify-center p-4">
        <div className="text-center">
          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-destructive/20 flex items-center justify-center">
            <Activity className="w-8 h-8 text-destructive" />
          </div>
          <h1 className="text-xl font-heading text-foreground mb-2">Sign-in Failed</h1>
          <p className="text-muted-foreground">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen gradient-nebula flex items-center justify-center p-4">
      <div className="text-center">
        <Loader2 className="w-10 h-10 animate-spin text-primary mx-auto mb-4" />
        <p className="text-muted-foreground">Completing sign-in�</p>
      </div>
    </div>
  );
}
