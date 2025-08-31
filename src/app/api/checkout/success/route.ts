// /app/api/checkout/success/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { clearCart } from '@/lib/cart/actions';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const transactionId = searchParams.get('transaction_id');
    const memberId = searchParams.get('member_id');

    if (!transactionId) {
      return NextResponse.redirect(new URL('/cart?error=missing_transaction', request.url));
    }

    // Clear the cart after successful payment
    await clearCart();

    // Redirect to success page with transaction info
    const successUrl = new URL('/checkout/success', request.url);
    successUrl.searchParams.set('transaction_id', transactionId);
    if (memberId) {
      successUrl.searchParams.set('member_id', memberId);
    }

    return NextResponse.redirect(successUrl);

  } catch (error) {
    console.error('Payment success handling error:', error);
    return NextResponse.redirect(new URL('/cart?error=payment_processing', request.url));
  }
}
