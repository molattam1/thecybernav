// /app/api/xpay/callback/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { sendPaymentConfirmationToCustomer, sendPaymentNotificationToAdmin } from '@/lib/email/resend';

interface XPayCallbackData {
  member_id: string | null;
  payment_id: string;
  merchant_id: string;
  total_amount: number;
  transaction_id: string;
  transaction_status: 'SUCCESSFUL' | 'FAILED';
  total_amount_piasters: number;
  [key: string]: string | number | boolean | null; // For custom fields
}

export async function POST(request: NextRequest) {
  try {
    const callbackData: XPayCallbackData = await request.json();
    
    console.log('XPay Callback received:', JSON.stringify(callbackData, null, 2));

    // Validate the callback data
    if (!callbackData.transaction_id || !callbackData.transaction_status) {
      console.error('Invalid callback data received');
      return NextResponse.json(
        { error: 'Invalid callback data' },
        { status: 400 }
      );
    }

    // Verify merchant_id matches your community_id
    if (callbackData.merchant_id !== process.env.XPAY_COMMUNITY_ID) {
      console.error('Merchant ID mismatch in callback');
      return NextResponse.json(
        { error: 'Unauthorized callback' },
        { status: 401 }
      );
    }

    // Process the payment based on status
    if (callbackData.transaction_status === 'SUCCESSFUL') {
      console.log(`Payment successful: ${callbackData.transaction_id}`);
      
      try {
        // Extract customer info and cart data from custom fields or transaction lookup
        const customerName = 'Customer'; // You might want to store this in custom fields
        const customerEmail = 'customer@example.com'; // Extract from transaction data
        const amount = callbackData.total_amount;
        const currency = 'EGP'; // Default or extract from callback
        
        // Mock cart items - in production, you'd fetch this from your database
        const cartItems = [
          {
            name: 'Product Name',
            quantity: 1,
            price: amount
          }
        ];
        
        const emailData = {
          customerName,
          customerEmail,
          transactionId: String(callbackData.payment_id),
          transactionUuid: callbackData.transaction_id,
          amount,
          currency,
          cartItems,
          paymentMethod: 'Card'
        };
        
        // Send emails in parallel
        const [customerResult, adminResult] = await Promise.allSettled([
          sendPaymentConfirmationToCustomer(emailData),
          sendPaymentNotificationToAdmin(emailData)
        ]);
        
        if (customerResult.status === 'fulfilled' && customerResult.value.success) {
          console.log('Customer confirmation email sent successfully');
        } else {
          console.error('Failed to send customer email:', customerResult);
        }
        
        if (adminResult.status === 'fulfilled' && adminResult.value.success) {
          console.log('Admin notification email sent successfully');
        } else {
          console.error('Failed to send admin email:', adminResult);
        }
        
      } catch (error) {
        console.error('Error sending payment emails:', error);
      }
      
      // TODO: Add additional business logic:
      // - Update order status in database
      // - Clear cart
      // - Update inventory
      
    } else if (callbackData.transaction_status === 'FAILED') {
      console.log(`Payment failed: ${callbackData.transaction_id}`);
      
      // TODO: Add your failure handling logic here:
      // - Log failed payment
      // - Send failure notification
      // - Update order status to failed
    }

    // Always return 200 OK to acknowledge receipt
    return NextResponse.json({ status: 'received' }, { status: 200 });

  } catch (error) {
    console.error('XPay callback processing error:', error);
    
    // Return 200 to prevent XPay from retrying
    return NextResponse.json(
      { error: 'Callback processing failed' },
      { status: 200 }
    );
  }
}
