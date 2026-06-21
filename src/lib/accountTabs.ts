export const ACCOUNT_BILLING_TABS = {
  subscription: 'subscription',
  orders: 'orders',
  refund: 'refund',
} as const;

export type AccountBillingTab =
  (typeof ACCOUNT_BILLING_TABS)[keyof typeof ACCOUNT_BILLING_TABS];

export const DASHBOARD_TABS = {
  ...ACCOUNT_BILLING_TABS,
  redeem: 'redeem',
  settings: 'settings',
} as const;

export type DashboardTab = (typeof DASHBOARD_TABS)[keyof typeof DASHBOARD_TABS];

const BILLING_TAB_SET = new Set<string>(Object.values(ACCOUNT_BILLING_TABS));
const DASHBOARD_TAB_SET = new Set<string>(Object.values(DASHBOARD_TABS));

export function parseBillingTab(value: string | null): AccountBillingTab {
  if (value && BILLING_TAB_SET.has(value)) {
    return value as AccountBillingTab;
  }
  return ACCOUNT_BILLING_TABS.subscription;
}

export function parseDashboardTab(value: string | null): DashboardTab {
  if (value && DASHBOARD_TAB_SET.has(value)) {
    return value as DashboardTab;
  }
  return DASHBOARD_TABS.settings;
}

export function billingTabHref(tab: AccountBillingTab): string {
  return `/account/subscription?tab=${tab}`;
}

export function dashboardTabHref(tab: DashboardTab): string {
  return `/dashboard?tab=${tab}`;
}
