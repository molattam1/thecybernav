// /lib/email/resend.ts
import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

export interface PaymentEmailData {
  customerName: string;
  customerEmail: string;
  transactionId: string;
  transactionUuid: string;
  amount: number;
  currency: string;
  cartItems: Array<{
    name: string;
    quantity: number;
    price: number;
  }>;
  paymentMethod: string;
}

export async function sendPaymentConfirmationToCustomer(data: PaymentEmailData) {
  try {
    const { data: emailResult, error } = await resend.emails.send({
      from: 'TheCyberNav <orders@thecybernav.com>',
      to: [data.customerEmail],
      subject: `Payment Confirmation - Order #${data.transactionId}`,
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <title>Payment Confirmation</title>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: #2563eb; color: white; padding: 20px; text-align: center; }
            .content { padding: 20px; background: #f9f9f9; }
            .order-details { background: white; padding: 15px; margin: 15px 0; border-radius: 5px; }
            .footer { text-align: center; padding: 20px; color: #666; }
            .success { color: #16a34a; font-weight: bold; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>Payment Confirmed!</h1>
            </div>
            <div class="content">
              <p>Dear ${data.customerName},</p>
              <p class="success">✅ Your payment has been successfully processed!</p>
              
              <div class="order-details">
                <h3>Order Details</h3>
                <p><strong>Transaction ID:</strong> ${data.transactionId}</p>
                <p><strong>Amount:</strong> ${data.amount} ${data.currency}</p>
                <p><strong>Payment Method:</strong> ${data.paymentMethod}</p>
                
                <h4>Items Ordered:</h4>
                <ul>
                  ${data.cartItems.map(item => 
                    `<li>${item.name} x${item.quantity} - ${item.price * item.quantity} ${data.currency}</li>`
                  ).join('')}
                </ul>
              </div>
              
              <p>Thank you for your purchase! We'll process your order shortly.</p>
              <p>If you have any questions, please contact our support team.</p>
            </div>
            <div class="footer">
              <p>© 2025 TheCyberNav. All rights reserved.</p>
            </div>
          </div>
        </body>
        </html>
      `,
    });

    if (error) {
      console.error('Failed to send customer email:', error);
      return { success: false, error };
    }

    console.log('Customer email sent successfully:', emailResult);
    return { success: true, data: emailResult };
  } catch (error) {
    console.error('Error sending customer email:', error);
    return { success: false, error };
  }
}

export async function sendPaymentNotificationToAdmin(data: PaymentEmailData) {
  try {
    const { data: emailResult, error } = await resend.emails.send({
      from: 'TheCyberNav <notifications@thecybernav.com>',
      to: ['omar.molattam50@gmail.com'], // Your admin email
      subject: `🎉 New Payment Received - ${data.amount} ${data.currency}`,
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <title>New Payment Notification</title>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: #16a34a; color: white; padding: 20px; text-align: center; }
            .content { padding: 20px; background: #f9f9f9; }
            .payment-details { background: white; padding: 15px; margin: 15px 0; border-radius: 5px; }
            .highlight { background: #fef3c7; padding: 10px; border-radius: 5px; margin: 10px 0; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>💰 New Payment Received!</h1>
            </div>
            <div class="content">
              <div class="highlight">
                <h2>Payment: ${data.amount} ${data.currency}</h2>
                <p>Customer: ${data.customerName} (${data.customerEmail})</p>
              </div>
              
              <div class="payment-details">
                <h3>Transaction Details</h3>
                <p><strong>Transaction ID:</strong> ${data.transactionId}</p>
                <p><strong>Transaction UUID:</strong> ${data.transactionUuid}</p>
                <p><strong>Payment Method:</strong> ${data.paymentMethod}</p>
                <p><strong>Customer Email:</strong> ${data.customerEmail}</p>
                
                <h4>Items Purchased:</h4>
                <ul>
                  ${data.cartItems.map(item => 
                    `<li>${item.name} x${item.quantity} - ${item.price * item.quantity} ${data.currency}</li>`
                  ).join('')}
                </ul>
              </div>
              
              <p><strong>Action Required:</strong> Process the order and prepare for shipment.</p>
            </div>
          </div>
        </body>
        </html>
      `,
    });

    if (error) {
      console.error('Failed to send admin email:', error);
      return { success: false, error };
    }

    console.log('Admin email sent successfully:', emailResult);
    return { success: true, data: emailResult };
  } catch (error) {
    console.error('Error sending admin email:', error);
    return { success: false, error };
  }
}
