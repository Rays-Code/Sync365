import { COUNTRY_FEATURES, COUNTRY_FEATURE_LABELS } from '@/lib/countryFeatures';

export type AdminFieldType = 'text' | 'number' | 'boolean' | 'select';

export interface AdminFieldConfig {
  key: string;
  label: string;
  type: AdminFieldType;
  required?: boolean;
  readOnlyOnEdit?: boolean;
  placeholder?: string;
  options?: { value: string; label: string }[];
}

export interface AdminTableConfig {
  table: string;
  label: string;
  idColumn?: string;
  upsertConflict?: string;
  fields: AdminFieldConfig[];
}

const featureOptions = Object.values(COUNTRY_FEATURES).map((key) => ({
  value: key,
  label: COUNTRY_FEATURE_LABELS[key],
}));

export const ADMIN_EDITABLE_TABLES: Record<string, AdminTableConfig> = {
  country_pricing: {
    table: 'country_pricing',
    label: 'Country pricing',
    upsertConflict: 'country_code',
    fields: [
      { key: 'country_code', label: 'Country code', type: 'text', required: true, readOnlyOnEdit: true, placeholder: 'IN' },
      { key: 'country_name', label: 'Country name', type: 'text', placeholder: 'India' },
      { key: 'monthly_price', label: 'Monthly price', type: 'number' },
      { key: 'yearly_price', label: 'Yearly price', type: 'number' },
      { key: 'currency', label: 'Currency', type: 'text', placeholder: 'AUD' },
      { key: 'monthly_stripe_price_id', label: 'Monthly Stripe price ID', type: 'text', placeholder: 'price_...' },
      { key: 'yearly_stripe_price_id', label: 'Yearly Stripe price ID', type: 'text', placeholder: 'price_...' },
      { key: 'is_free', label: 'Free in this country', type: 'boolean' },
    ],
  },
  pricing_plans: {
    table: 'pricing_plans',
    label: 'Pricing plan',
    fields: [
      { key: 'plan_key', label: 'Plan key', type: 'text', required: true, readOnlyOnEdit: true, placeholder: 'plus_monthly' },
      { key: 'name', label: 'Name', type: 'text', required: true },
      { key: 'description', label: 'Description', type: 'text' },
      { key: 'price', label: 'Display price', type: 'number' },
      { key: 'currency', label: 'Currency', type: 'text', placeholder: 'AUD' },
      { key: 'billing_interval', label: 'Billing interval', type: 'select', options: [
        { value: 'month', label: 'Month' },
        { value: 'year', label: 'Year' },
        { value: 'forever', label: 'Forever' },
        { value: 'organisation', label: 'Organisation' },
      ]},
      { key: 'stripe_price_id', label: 'Stripe price ID', type: 'text', placeholder: 'price_...' },
      { key: 'stripe_product_id', label: 'Stripe product ID', type: 'text', placeholder: 'prod_...' },
      { key: 'discount_price', label: 'Discount price', type: 'number' },
      { key: 'discount_stripe_price_id', label: 'Discount Stripe price ID', type: 'text' },
      { key: 'sort_order', label: 'Sort order', type: 'number' },
      { key: 'is_active', label: 'Active', type: 'boolean' },
    ],
  },
  country_access: {
    table: 'country_access',
    label: 'Country access',
    idColumn: 'country_code',
    upsertConflict: 'country_code',
    fields: [
      { key: 'country_code', label: 'Country code', type: 'text', required: true, readOnlyOnEdit: true, placeholder: 'CN' },
      { key: 'country_name', label: 'Country name', type: 'text' },
      { key: 'is_allowed', label: 'Allowed', type: 'boolean' },
      { key: 'block_message', label: 'Block message', type: 'text', placeholder: 'Not available in your region.' },
    ],
  },
  country_feature_flags: {
    table: 'country_feature_flags',
    label: 'Country feature flag',
    fields: [
      { key: 'country_code', label: 'Country code', type: 'text', required: true, placeholder: 'CN' },
      { key: 'feature_key', label: 'Feature', type: 'select', required: true, options: featureOptions },
      { key: 'enabled', label: 'Enabled', type: 'boolean' },
    ],
  },
  app_settings: {
    table: 'app_settings',
    label: 'App setting',
    fields: [
      { key: 'setting_key', label: 'Setting key', type: 'text', required: true, readOnlyOnEdit: true },
      { key: 'setting_value', label: 'Setting value', type: 'text', required: true },
    ],
  },
};

export function getEditableTableConfig(table: string): AdminTableConfig | undefined {
  return ADMIN_EDITABLE_TABLES[table];
}
