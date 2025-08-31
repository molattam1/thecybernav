# XPay Payment Setup Guide

## Environment Variables Required

Add these to your `.env.local` file:

```bash
# XPay Configuration
XPAY_API_KEY=your_api_key_here
XPAY_COMMUNITY_ID=your_merchant_id_here
XPAY_VARIABLE_AMOUNT_ID=your_variable_amount_id_here

# Other required variables
CMS_URL=your_cms_url_here
NEXT_PUBLIC_CMS_URL=your_cms_url_here
```

## XPay Dashboard Configuration

### 1. Login to XPay Dashboard
- **Testing**: https://staging.xpay.app/admin/
- **Production**: https://community.xpay.app/admin/

### 2. Create/Update Variable Amount Payment

1. Navigate to **API Payment** under **API Integrations**
2. Click **Add Variable Amount** or edit existing one
3. Configure the following URLs:

#### Redirect URL (Success Page)
```
https://thecybernav.com/api/checkout/success
```
This is where users are redirected after payment completion.

#### Callback URL (Webhook)
```
https://thecybernav.com/api/xpay/callback
```
This is where XPay sends payment status updates.

### 3. Required Settings
- ✅ **Is Active**: Checked
- ✅ **Require Member ID**: Unchecked (unless needed)
- 📝 **Name**: Your payment description
- 📝 **Description**: Payment details

### 4. Save Configuration
- Click **Save**
- Note the **ID** value from the table - this is your `XPAY_VARIABLE_AMOUNT_ID`

## API Endpoints Created

### Payment Callback Handler
- **URL**: `/api/xpay/callback`
- **Method**: POST
- **Purpose**: Receives payment status updates from XPay

### Success Handler
- **URL**: `/api/checkout/success`  
- **Method**: GET
- **Purpose**: Handles user redirect after payment

## Testing

1. Ensure all environment variables are set
2. Test with staging URLs first
3. Check browser console and server logs for debugging
4. Verify callback endpoint receives POST requests from XPay

## Fixed Issues

- ✅ Base URL configuration (staging vs production)
- ✅ Missing callback endpoint
- ✅ Proper URL handling in success redirect
- ✅ Enhanced error logging and debugging
