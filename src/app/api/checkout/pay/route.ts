// /app/api/checkout/pay/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { createXPayClient } from '@/lib/xpay/client';
import { readCart } from '@/lib/cart/cookie';
import type { XPayBillingData } from '@/lib/xpay/types';

interface Product {
  id: string;
  price: number;
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { 
      billingData, 
      currency = 'EGP', 
      paymentMethod = 'card',
      language = 'en' 
    }: {
      billingData: XPayBillingData;
      currency?: string;
      paymentMethod?: string;
      language?: string;
    } = body;

    // Validate billing data
    if (!billingData?.name || !billingData?.email || !billingData?.phone_number) {
      return NextResponse.json(
        { error: 'Missing required billing information' },
        { status: 400 }
      );
    }

    // Get cart data and calculate total
    const cart = await readCart();
    if (cart.items.length === 0) {
      return NextResponse.json(
        { error: 'Cart is empty' },
        { status: 400 }
      );
    }

    // Fetch product prices
    const CMS_URL = process.env.CMS_URL ?? process.env.NEXT_PUBLIC_CMS_URL!;
    const productIds = cart.items.map(item => item.id);
    const query = productIds.map(id => `where[id][in]=${id}`).join('&');
    
    const productsRes = await fetch(`${CMS_URL}/api/products?${query}`, {
      cache: 'no-store',
      headers: { Accept: 'application/json' },
    });
    
    const productsData = await productsRes.json();
    const products = productsData?.docs ?? [];
    
    const originalAmount = cart.items.reduce((sum, cartItem) => {
      const product = products.find((p: Product) => p.id === cartItem.id);
      return sum + (product?.price || 0) * cartItem.qty;
    }, 0);

    if (originalAmount <= 0) {
      return NextResponse.json(
        { error: 'Invalid cart total' },
        { status: 400 }
      );
    }

    // First, prepare amount to get total with fees
    const xpayClient = createXPayClient();
    const prepareResponse = await xpayClient.prepareAmount({
      amount: originalAmount,
      community_id: process.env.XPAY_COMMUNITY_ID!,
      currency,
      selected_payment_method: paymentMethod,
    });

    // Create payment with XPay
    const paymentResponse = await xpayClient.createPayment({
      billing_data: billingData,
      amount: prepareResponse.data.total_amount,
      original_amount: originalAmount,
      currency,
      variable_amount_id: parseInt(process.env.XPAY_VARIABLE_AMOUNT_ID!),
      language,
      community_id: process.env.XPAY_COMMUNITY_ID!,
      pay_using: paymentMethod,
      custom_fields: [
        {
          field_label: 'cart_items_count',
          field_value: cart.items.length,
        },
        {
          field_label: 'order_timestamp',
          field_value: Date.now(),
        }
      ],
    });

    // Transaction data stored for potential future use
    // Could be persisted to database if needed

    return NextResponse.json({
      iframe_url: paymentResponse.data.iframe_url,
      transaction_id: paymentResponse.data.transaction_id,
      transaction_uuid: paymentResponse.data.transaction_uuid,
      transaction_status: paymentResponse.data.transaction_status,
      amounts: {
        original: originalAmount,
        total: prepareResponse.data.total_amount,
        currency: prepareResponse.data.total_amount_currency,
      },
    });

  } catch (error) {
    console.error('Payment creation error:', error);
    return NextResponse.json(
      { error: 'Failed to create payment' },
      { status: 500 }
    );
  }
}
