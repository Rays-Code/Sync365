export function formatPlanLabel(plan: string | null | undefined): string {
  if (!plan) return 'Plus';
  const p = plan.toLowerCase();
  if (p.includes('year') || p === 'yearly' || p === 'annual') return 'Plus Annual';
  if (p.includes('month') || p === 'monthly') return 'Plus Monthly';
  return plan;
}

export function formatBillingDate(iso: string | null | undefined): string {
  if (!iso) return '�';
  return new Date(iso).toLocaleDateString(undefined, {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

export function isMonthlyPlan(plan: string | null | undefined, billingInterval?: string | null): boolean {
  if (billingInterval === 'month') return true;
  if (billingInterval === 'year') return false;
  if (!plan) return false;
  const p = plan.toLowerCase();
  return p.includes('month') || p === 'monthly';
}
