import { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { RotateCcw, CheckCircle, Loader2, Clock } from 'lucide-react';
import { toast } from 'sonner';
import { submitRefundRequest, type RefundRequestRow } from '@/services/supabaseFunctions';
import { supabase } from '@/integrations/supabase/client';
import { useCountry } from '@/contexts/CountryContext';
import { COUNTRY_FEATURES } from '@/lib/countryFeatures';
import RegionUnavailable from '@/components/RegionUnavailable';
import { billingTabHref } from '@/lib/accountTabs';

export default function RequestRefund({ userId, userEmail }: { userId: string; userEmail: string }) {
  const { country, isFeatureEnabled } = useCountry();
  const refundAllowed = isFeatureEnabled(COUNTRY_FEATURES.REFUND_REQUESTS);
  const [reason, setReason] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [history, setHistory] = useState<RefundRequestRow[]>([]);
  const [loadingHistory, setLoadingHistory] = useState(true);
  const [historyError, setHistoryError] = useState<string | null>(null);
  const [isFreeRedemption, setIsFreeRedemption] = useState(false);
  const [checkingSub, setCheckingSub] = useState(true);

  useEffect(() => {
    supabase
      .from('subscriptions')
      .select('amount, stripe_subscription_id')
      .eq('user_id', userId)
      .in('status', ['active', 'trialing', 'past_due'])
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle()
      .then(({ data }) => {
        if (data && !data.stripe_subscription_id && Number(data.amount) === 0) {
          setIsFreeRedemption(true);
        }
      })
      .finally(() => setCheckingSub(false));
  }, [userId]);

  const loadHistory = useCallback(async () => {
    setLoadingHistory(true);
    setHistoryError(null);
    const { data, error } = await supabase
      .from('refund_requests')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(10);

    if (error) {
      setHistoryError(error.message);
      setHistory([]);
    } else {
      setHistory((data ?? []) as RefundRequestRow[]);
    }
    setLoadingHistory(false);
  }, [userId]);

  useEffect(() => {
    if (refundAllowed) loadHistory();
  }, [refundAllowed, loadHistory]);

  const handleSubmit = async () => {
    if (!reason.trim()) {
      toast.error('Please provide a reason for the refund.');
      return;
    }

    setSubmitting(true);
    try {
      await submitRefundRequest(reason.trim(), country ?? undefined);
      setReason('');
      toast.success('Refund request submitted. Check your email for confirmation.');
      loadHistory();
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Failed to submit refund request.');
    } finally {
      setSubmitting(false);
    }
  };

  if (!refundAllowed) {
    return (
      <Card className="glass border-border/50">
        <CardContent className="py-8">
          <RegionUnavailable feature={COUNTRY_FEATURES.REFUND_REQUESTS} />
        </CardContent>
      </Card>
    );
  }

  if (!checkingSub && isFreeRedemption) {
    return (
      <Card className="glass border-border/50">
        <CardContent className="py-12 text-center">
          <CheckCircle className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
          <p className="text-foreground font-heading text-lg">Free Subscription</p>
          <p className="text-muted-foreground mt-2">
            This subscription was obtained via a redemption code and is not eligible for a refund.
          </p>
        </CardContent>
      </Card>
    );
  }

  const hasPending = history.some((r) => r.status === 'pending');

  return (
    <div className="space-y-6">
      {historyError && (
        <p className="text-sm text-destructive text-center">
          Could not load your requests: {historyError}
        </p>
      )}

      {history.length > 0 && (
        <Card className="glass border-border/50">
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-heading">Your requests</CardTitle>
            <CardDescription>Track status here and via email updates</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {loadingHistory ? (
              <Loader2 className="w-5 h-5 animate-spin text-primary mx-auto" />
            ) : (
              history.map((row) => (
                <div
                  key={row.id}
                  className="text-sm rounded-lg border border-border/50 p-3 bg-muted/20"
                >
                  <div className="flex justify-between items-center gap-2 mb-1">
                    <span className="capitalize text-xs font-medium">
                      {row.status === 'pending' && (
                        <Clock className="w-3 h-3 inline mr-1 text-amber-500" />
                      )}
                      {row.status}
                    </span>
                    <span className="text-xs text-muted-foreground">
                      {new Date(row.created_at).toLocaleDateString()}
                    </span>
                  </div>
                  <p className="text-muted-foreground whitespace-pre-wrap">{row.reason}</p>
                  {row.admin_notes && row.status === 'rejected' && (
                    <p className="text-xs text-muted-foreground mt-2 border-t border-border/40 pt-2">
                      {row.admin_notes}
                    </p>
                  )}
                </div>
              ))
            )}
          </CardContent>
        </Card>
      )}

      {hasPending ? (
        <Card className="glass border-border/50">
          <CardContent className="py-12 text-center">
            <CheckCircle className="w-12 h-12 text-primary mx-auto mb-3" />
            <p className="text-foreground font-heading text-lg">Refund request pending</p>
            <p className="text-muted-foreground mt-2">
              We&apos;ll email you when your request is approved or reviewed.
            </p>
          </CardContent>
        </Card>
      ) : (
        <Card className="glass border-border/50">
          <CardHeader>
            <CardTitle className="font-heading text-xl flex items-center gap-2">
              <RotateCcw className="w-5 h-5 text-primary" />
              Request a Refund
            </CardTitle>
            <CardDescription>
              Submit for team review. See our{' '}
              <Link to="/refund-policy" className="text-primary hover:underline">
                refund policy
              </Link>
              .
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="refund-email">Account Email</Label>
              <Input
                id="refund-email"
                value={userEmail}
                disabled
                className="mt-2 bg-muted/30 border-border/50"
              />
            </div>
            <div>
              <Label htmlFor="refund-reason">Reason for Refund</Label>
              <Textarea
                id="refund-reason"
                placeholder="Describe why you'd like a refund..."
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                className="mt-2 bg-muted/30 border-border/50 min-h-[100px]"
                disabled={submitting}
              />
            </div>
            <Button
              onClick={handleSubmit}
              disabled={submitting || !reason.trim()}
              className="w-full"
              variant="destructive"
            >
              {submitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin mr-2" /> Submitting...
                </>
              ) : (
                'Submit Refund Request'
              )}
            </Button>
          </CardContent>
        </Card>
      )}

      <p className="text-xs text-center text-muted-foreground">
        Manage subscription details on{' '}
        <Link to={billingTabHref('subscription')} className="text-primary hover:underline">
          Billing & subscription
        </Link>
        .
      </p>
    </div>
  );
}
