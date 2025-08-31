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
      'Content-Type': 'application/json',
      'x-api-key': this.config.apiKey,
    };
  }

  async prepareAmount(request: XPayPrepareAmountRequest): Promise<XPayPrepareAmountResponse> {
    const url = `${this.config.baseUrl}/payments/prepare-amount/`;
    
    const response = await fetch(url, {
      method: 'POST',
      headers: this.headers,
      body: JSON.stringify({
        ...request,
        community_id: this.config.communityId,
      }),
    });

    if (!response.ok) {
      throw new Error(`XPay prepare amount failed: ${response.status} ${response.statusText}`);
    }

    return response.json();
  }

  async createPayment(request: XPayPaymentRequest): Promise<XPayPaymentResponse> {
    const url = `${this.config.baseUrl}/payments/pay/variable-amount/`;
    
    const requestBody = {
      ...request,
      community_id: this.config.communityId,
      variable_amount_id: this.config.variableAmountId,
    };

    console.log('XPay Request URL:', url);
    console.log('XPay Request Body:', JSON.stringify(requestBody, null, 2));
    console.log('XPay Headers:', this.headers);
    
    const response = await fetch(url, {
      method: 'POST',
      headers: this.headers,
      body: JSON.stringify(requestBody),
    });

    const responseText = await response.text();
    console.log('XPay Response Status:', response.status);
    console.log('XPay Response Body:', responseText);

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
  const config: XPayConfig = {
    apiKey: process.env.XPAY_API_KEY!,
    communityId: process.env.XPAY_COMMUNITY_ID!,
    variableAmountId: parseInt(process.env.XPAY_VARIABLE_AMOUNT_ID!),
    baseUrl: process.env.NODE_ENV === 'production' 
      ? 'https://community.xpay.app/api/v1'
      : 'https://staging.xpay.app/api/v1',
    isProduction: process.env.NODE_ENV === 'production',
  };

  return new XPayClient(config);
}
