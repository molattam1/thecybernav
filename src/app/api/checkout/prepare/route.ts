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

    // Prepare amount with XPay (convert to piasters: 1 EGP = 100 piasters)
    const amountInPiasters = Math.round(subtotal * 100);
    const xpayClient = createXPayClient();
    const prepareResponse = await xpayClient.prepareAmount({
      amount: amountInPiasters,
      community_id: process.env.XPAY_COMMUNITY_ID!,
      currency,
      selected_payment_method: paymentMethod,
    });

    return NextResponse.json({
      original_amount: subtotal,
      total_amount: prepareResponse.data.total_amount / 100, // Convert back from piasters
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
