// /app/api/xpay/callback/route.ts
import { NextRequest, NextResponse } from 'next/server';

interface XPayCallbackData {
  member_id: string | null;
  payment_id: string;
  merchant_id: string;
  total_amount: number;
  transaction_id: string;
  transaction_status: 'SUCCESSFUL' | 'FAILED';
  total_amount_piasters: number;
  [key: string]: any; // For custom fields
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
      
      // TODO: Add your business logic here:
      // - Update order status in database
      // - Send confirmation email
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
