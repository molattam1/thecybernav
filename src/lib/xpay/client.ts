// /lib/xpay/client.ts
import type { 
  XPayConfig,
  XPayPrepareAmountRequest,
  XPayPrepareAmountResponse,
  XPayPaymentRequest,
  XPayPaymentResponse
} from './types';

export class XPayClient {
  private config: XPayConfig;

  constructor(config: XPayConfig) {
    this.config = config;
  }

  private get headers() {
    return {
      'Content-Type': 'application/x-www-form-urlencoded',
      'x-api-key': this.config.apiKey,
    };
  }

  private encodeFormData(data: Record<string, unknown>): string {
    const params = new URLSearchParams();
    
    const addParam = (key: string, value: unknown) => {
      if (value !== null && value !== undefined) {
        if (typeof value === 'object' && !Array.isArray(value)) {
          // Handle nested objects like billing_data
          Object.entries(value).forEach(([nestedKey, nestedValue]) => {
            params.append(`${key}.${nestedKey}`, String(nestedValue));
          });
        } else if (Array.isArray(value)) {
          // Handle arrays like custom_fields - XPay expects specific format
          value.forEach((item, index) => {
            if (typeof item === 'object') {
              Object.entries(item).forEach(([nestedKey, nestedValue]) => {
                params.append(`${key}[${index}][${nestedKey}]`, String(nestedValue));
              });
            } else {
              params.append(`${key}[${index}]`, String(item));
            }
          });
        } else {
          params.append(key, String(value));
        }
      }
    };

    Object.entries(data).forEach(([key, value]) => {
      addParam(key, value);
    });

    return params.toString();
  }

  async prepareAmount(request: XPayPrepareAmountRequest): Promise<XPayPrepareAmountResponse> {
    const url = `${this.config.baseUrl}/payments/prepare-amount/`;
    
    const requestData = {
      amount: request.amount, // Use float value directly, not piasters
      community_id: request.community_id,
      currency: request.currency || 'EGP',
      selected_payment_method: request.selected_payment_method || 'card',
    };

    const formData = this.encodeFormData(requestData);

    console.log('XPay Prepare Amount URL:', url);
    console.log('XPay Prepare Amount Request:', requestData);
    console.log('XPay Prepare Amount Form Data:', formData);
    console.log('XPay Prepare Amount Headers:', this.headers);
    
    const response = await fetch(url, {
      method: 'POST',
      headers: this.headers,
      body: formData,
    });

    const responseText = await response.text();
    console.log('XPay Prepare Amount Response Status:', response.status);
    console.log('XPay Prepare Amount Response Body:', responseText);

    if (!response.ok) {
      throw new Error(`XPay prepare amount failed: ${response.status} ${response.statusText}. Response: ${responseText}`);
    }

    try {
      return JSON.parse(responseText);
    } catch {
      throw new Error(`Invalid JSON response from XPay prepare amount: ${responseText}`);
    }
  }

  async createPayment(request: XPayPaymentRequest): Promise<XPayPaymentResponse> {
    const url = `${this.config.baseUrl}/payments/pay/variable-amount`;
    
    const requestData = {
      billing_data: request.billing_data,
      amount: request.amount, // Use float value directly
      original_amount: request.original_amount, // Use float value directly
      currency: request.currency || 'EGP',
      variable_amount_id: request.variable_amount_id,
      language: request.language || 'en',
      community_id: request.community_id,
      pay_using: request.pay_using || 'card',
      custom_fields: request.custom_fields || [],
    };

    const formData = this.encodeFormData(requestData);

    console.log('XPay Payment URL:', url);
    console.log('XPay Payment Request:', requestData);
    console.log('XPay Payment Form Data:', formData);
    console.log('XPay Headers:', this.headers);
    
    const response = await fetch(url, {
      method: 'POST',
      headers: this.headers,
      body: formData,
    });

    const responseText = await response.text();
    console.log('XPay Payment Response Status:', response.status);
    console.log('XPay Payment Response Body:', responseText);

    if (!response.ok) {
      throw new Error(`XPay payment creation failed: ${response.status} ${response.statusText}. Response: ${responseText}`);
    }

    try {
      return JSON.parse(responseText);
    } catch {
      throw new Error(`Invalid JSON response from XPay: ${responseText}`);
    }
  }
}

export function createXPayClient(): XPayClient {
  // Force staging environment for testing
  const config: XPayConfig = {
    apiKey: process.env.XPAY_API_KEY!,
    communityId: process.env.XPAY_COMMUNITY_ID!,
    variableAmountId: parseInt(process.env.XPAY_VARIABLE_AMOUNT_ID!),
    baseUrl: 'https://staging.xpay.app/api/v1',
    isProduction: false,
  };

  return new XPayClient(config);
}
