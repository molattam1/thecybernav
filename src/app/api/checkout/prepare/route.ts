// /app/api/checkout/prepare/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { createXPayClient } from '@/lib/xpay/client';
import { readCart } from '@/lib/cart/cookie';

interface Product {
  id: string;
  price: number;
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { currency = 'EGP', paymentMethod = 'card' } = body;

    // Get cart data
    const cart = await readCart();
    if (cart.items.length === 0) {
      return NextResponse.json(
        { error: 'Cart is empty' },
        { status: 400 }
      );
    }

    // Calculate cart total (you'll need to fetch product prices)
    const CMS_URL = process.env.CMS_URL ?? process.env.NEXT_PUBLIC_CMS_URL!;
    const productIds = cart.items.map(item => item.id);
    const query = productIds.map(id => `where[id][in]=${id}`).join('&');
    
    const productsRes = await fetch(`${CMS_URL}/api/products?${query}`, {
      cache: 'no-store',
      headers: { Accept: 'application/json' },
    });
    
    const productsData = await productsRes.json();
    const products = productsData?.docs ?? [];
    
    const subtotal = cart.items.reduce((sum, cartItem) => {
      const product = products.find((p: Product) => p.id === cartItem.id);
      return sum + (product?.price || 0) * cartItem.qty;
    }, 0);

    if (subtotal <= 0) {
      return NextResponse.json(
        { error: 'Invalid cart total' },
        { status: 400 }
      );
    }

    // Validate amount limits (XPay max: 999,999 piasters = 9,999.99 EGP)
    const maxAmountEGP = 9999.99;
    if (subtotal > maxAmountEGP) {
      return NextResponse.json(
        { error: `Cart total exceeds maximum limit of ${maxAmountEGP} EGP` },
        { status: 400 }
      );
    }

    // Prepare amount with XPay (use float value directly)
    console.log('Prepare amounts:', {
      subtotal,
      currency,
      paymentMethod
    });
    
    const xpayClient = createXPayClient();
    const prepareResponse = await xpayClient.prepareAmount({
      amount: subtotal, // Use float value directly
      community_id: process.env.XPAY_COMMUNITY_ID!,
      currency,
      selected_payment_method: paymentMethod,
    });

    return NextResponse.json({
      original_amount: subtotal,
      total_amount: prepareResponse.data.total_amount, // Use response value directly
      currency: prepareResponse.data.total_amount_currency,
      cart_items: cart.items.length,
    });

  } catch (error) {
    console.error('Prepare amount error:', error);
    return NextResponse.json(
      { error: 'Failed to prepare payment amount' },
      { status: 500 }
    );
  }
}
