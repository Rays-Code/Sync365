import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Ticket, CheckCircle, AlertCircle, Loader2, ShoppingCart } from 'lucide-react';
import { toast } from 'sonner';
import { userRedeemCode } from '@/services/supabaseFunctions';
import { useCountry } from '@/contexts/CountryContext';
import { COUNTRY_FEATURES } from '@/lib/countryFeatures';
import RegionUnavailable from '@/components/RegionUnavailable';

export default function RedeemCode({ userId }: { userId: string }) {
  const { country, isFeatureEnabled } = useCountry();
  const redemptionAllowed = isFeatureEnabled(COUNTRY_FEATURES.CODE_REDEMPTION);
  const [code, setCode] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [redeemed, setRedeemed] = useState(false);
  const [redeemedProduct, setRedeemedProduct] = useState('');
  const [redeemedDiscount, setRedeemedDiscount] = useState('');
  const [autoActivated, setAutoActivated] = useState(false);

  const handleRedeem = async () => {
    if (!code.trim()) {
      toast.error('Please enter a redemption code.');
      return;
    }

    if (!redemptionAllowed) {
      toast.error('Code redemption is not available in your region.');
      return;
    }

    setSubmitting(true);
    try {
      const res = await userRedeemCode(code.trim(), country || undefined);
      if (res?.success) {
        setRedeemed(true);
        setRedeemedProduct(res.product_name || '');
        setRedeemedDiscount(res.discount || '');
        setAutoActivated(!!res.auto_activated);
        toast.success('Code redeemed successfully!');
      } else {
        toast.error('Invalid or expired code.');
      }
    } catch (err: any) {
      const msg = err.message || '';
      if (msg.includes('already used this code') || msg.includes('already have a pending discount') || msg.includes('already have an active subscription')) {
        toast.error(msg);
      } else {
        toast.error(msg || 'Failed to redeem code. Please try again.');
      }
    } finally {
      setSubmitting(false);
    }
  };

  if (redeemed) {
    return (
      <Card className="glass border-border/50">
        <CardContent className="py-12 text-center">
          <CheckCircle className="w-12 h-12 text-primary mx-auto mb-3" />
          <p className="text-foreground font-heading text-lg">
            {autoActivated ? 'Subscription Activated!' : 'Code Redeemed!'}
          </p>
          {redeemedProduct && (
            <p className="text-primary mt-1 font-medium">{redeemedProduct}</p>
          )}
          {redeemedDiscount && (
            <p className="text-secondary text-lg font-semibold mt-1">{redeemedDiscount}</p>
          )}
          {!autoActivated && (
            <div className="flex items-center justify-center gap-2 mt-4 text-sm text-muted-foreground">
              <ShoppingCart className="w-4 h-4" />
              <span>Applied at next checkout</span>
            </div>
          )}
        </CardContent>
      </Card>
    );
  }

  if (!redemptionAllowed) {
    return (
      <Card className="glass border-border/50">
        <CardContent className="py-8">
          <RegionUnavailable feature={COUNTRY_FEATURES.CODE_REDEMPTION} />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="glass border-border/50">
      <CardHeader>
        <CardTitle className="font-heading text-xl flex items-center gap-2">
          <Ticket className="w-5 h-5 text-primary" />
          Redeem a Code
        </CardTitle>
        <CardDescription>Enter a redemption code or Stripe coupon</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="p-3 rounded-lg bg-muted/30 border border-border/50 flex items-start gap-2">
          <AlertCircle className="w-4 h-4 text-muted-foreground mt-0.5 shrink-0" />
          <p className="text-xs text-muted-foreground">
            Codes are case-insensitive. Each code can only be used once.
          </p>
        </div>
        <div>
          <Label htmlFor="redeem-code">Redemption Code</Label>
          <Input
            id="redeem-code"
            placeholder="Enter code or coupon"
            value={code}
            onChange={(e) => setCode(e.target.value)}
            className="mt-2 bg-muted/30 border-border/50 uppercase"
            disabled={submitting}
          />
        </div>
        <Button onClick={handleRedeem} disabled={submitting || !code.trim()} className="w-full">
          {submitting ? <><Loader2 className="w-4 h-4 animate-spin mr-2" /> Redeeming...</> : 'Redeem Code'}
        </Button>
      </CardContent>
    </Card>
  );
}
