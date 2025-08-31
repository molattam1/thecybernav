// /lib/xpay/types.ts

export interface XPayBillingData {
  name: string;
  email: string;
  phone_number: string;
}

export interface XPayPrepareAmountRequest {
  amount: number;
  community_id: string;
  currency?: string; // default: "EGP"
  selected_payment_method?: string; // default: "card"
}

export interface XPayPrepareAmountResponse {
  status: {
    code: number;
    message: string;
    errors: string[];
  };
  data: {
    total_amount: number;
    total_amount_currency: string;
  };
}

export interface XPayPaymentRequest {
  billing_data: XPayBillingData;
  amount: number;
  original_amount: number;
  currency?: string; // default: "EGP"
  variable_amount_id: number;
  language?: string; // default: "en"
  community_id: string;
  pay_using?: string; // default: "card"
  custom_fields?: Array<{
    field_label: string;
    field_value: string | number | boolean;
  }>;
}

export interface XPayPaymentResponse {
  status: {
    code: number;
    message: string;
    errors: string[];
  };
  data: {
    iframe_url: string;
    transaction_id: number;
    transaction_status: string;
    transaction_uuid: string;
  };
}

export interface XPayConfig {
  apiKey: string;
  communityId: string;
  variableAmountId: number;
  baseUrl: string;
  isProduction: boolean;
}
