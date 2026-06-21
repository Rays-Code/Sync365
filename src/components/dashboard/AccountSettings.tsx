import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Settings, Mail, Calendar, Hash, Shield } from 'lucide-react';
import { format } from 'date-fns';
import { maskEmail } from '@/lib/mask-email';

interface AccountSettingsProps {
  email: string;
  uniqueId: string | null;
  memberSince: string | null;
  onSignOut: () => void;
}

export default function AccountSettings({ email, uniqueId, memberSince, onSignOut }: AccountSettingsProps) {
  return (
    <Card className="glass border-border/50">
      <CardHeader>
        <CardTitle className="font-heading text-xl flex items-center gap-2">
          <Settings className="w-5 h-5 text-primary" />
          Account Settings
        </CardTitle>
        <CardDescription>Your account information and preferences</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {uniqueId && (
          <div className="flex items-center gap-3 p-3 rounded-lg bg-primary/10 border border-primary/20">
            <Hash className="w-4 h-4 text-primary" />
            <div>
              <p className="text-xs text-muted-foreground">Your Unique ID</p>
              <p className="text-foreground font-medium">{uniqueId}</p>
              <p className="text-xs text-muted-foreground mt-1">
                This is your anonymous 7-digit identifier used across all platforms.
              </p>
            </div>
          </div>
        )}

        <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/30">
          <Mail className="w-4 h-4 text-muted-foreground" />
          <div>
            <p className="text-xs text-muted-foreground">Email (masked for privacy)</p>
            <p className="text-foreground">{maskEmail(email)}</p>
          </div>
        </div>

        {memberSince && (
          <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/30">
            <Calendar className="w-4 h-4 text-muted-foreground" />
            <div>
              <p className="text-xs text-muted-foreground">Member since</p>
              <p className="text-foreground">
                {format(new Date(memberSince), 'dd MMMM yyyy')}
              </p>
            </div>
          </div>
        )}

        <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/30">
          <Shield className="w-4 h-4 text-muted-foreground" />
          <div>
            <p className="text-xs text-muted-foreground">Privacy</p>
            <p className="text-foreground text-sm">
              Your identity is protected. We use your Unique ID instead of personal information.
            </p>
          </div>
        </div>

        <div className="pt-4 border-t border-border/50">
          <Button variant="destructive" onClick={onSignOut} className="w-full">
            Sign Out
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
