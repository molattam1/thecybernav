// /app/api/checkout/success/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { clearCart } from '@/lib/cart/actions';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const transactionId = searchParams.get('transaction_id');
    const transactionStatus = searchParams.get('transaction_status');
    const memberId = searchParams.get('member_id');

    console.log('XPay redirect received:', {
      transactionId,
      transactionStatus,
      memberId,
      fullUrl: request.url
    });

    if (!transactionId) {
      return NextResponse.redirect(new URL('/cart?error=missing_transaction', request.url));
    }

    // Handle different transaction statuses
    if (transactionStatus === 'SUCCESSFUL') {
      // Clear the cart after successful payment
      await clearCart();

      // Redirect to success page with transaction info
      const successUrl = new URL('/checkout/success', request.url);
      successUrl.searchParams.set('transaction_id', transactionId);
      if (memberId) {
        successUrl.searchParams.set('member_id', memberId);
      }

      return NextResponse.redirect(successUrl);
    } else {
      // Handle failed or other statuses
      const errorUrl = new URL('/cart', request.url);
      errorUrl.searchParams.set('error', 'payment_failed');
      errorUrl.searchParams.set('transaction_id', transactionId);
      
      return NextResponse.redirect(errorUrl);
    }

  } catch (error) {
    console.error('Payment success handling error:', error);
    return NextResponse.redirect(new URL('/cart?error=payment_processing', request.url));
  }
}
