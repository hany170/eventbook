# Stripe Payment Setup Guide

## Current Issue
The payment flow is not working because the Stripe API keys in your `.env` file are set to placeholder values:
- `STRIPE_SECRET_KEY=sk_test_replace_me`
- `STRIPE_WEBHOOK_SECRET=whsec_replace_me`

## Solution Steps

### 1. Create a Stripe Account
1. Go to [https://stripe.com](https://stripe.com)
2. Sign up for a free account
3. Complete the account verification process

### 2. Get Your API Keys
1. Log into your Stripe Dashboard
2. Go to "Developers" → "API keys"
3. Copy your **Publishable key** (starts with `pk_test_`)
4. Copy your **Secret key** (starts with `sk_test_`)

### 3. Update Environment Variables
Update your `.env` file with the real Stripe keys:

```env
# Replace these placeholder values with your actual Stripe keys
STRIPE_SECRET_KEY=sk_test_your_actual_secret_key_here
STRIPE_WEBHOOK_SECRET=whsec_your_webhook_secret_here
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_your_actual_publishable_key_here
```

### 4. Set Up Webhook Endpoint
1. In your Stripe Dashboard, go to "Developers" → "Webhooks"
2. Click "Add endpoint"
3. Set the endpoint URL to: `http://localhost:3000/api/stripe/webhook` (for development)
4. Select the event: `checkout.session.completed`
5. Click "Add endpoint"
6. Copy the webhook signing secret (starts with `whsec_`)
7. Update `STRIPE_WEBHOOK_SECRET` in your `.env` file

### 5. Test the Payment Flow
After updating the environment variables:

1. Restart your development server:
   ```bash
   npm run dev
   ```

2. Navigate to an event and try to purchase tickets
3. Use Stripe's test card numbers:
   - **Success**: `4242 4242 4242 4242`
   - **Decline**: `4000 0000 0000 0002`
   - Use any future expiry date and any 3-digit CVC

### 6. Production Setup
For production deployment:

1. Switch to live mode in Stripe Dashboard
2. Get your live API keys
3. Update environment variables with live keys
4. Set up production webhook endpoint: `https://yourdomain.com/api/stripe/webhook`

## What's Been Fixed

✅ **Checkout Session API**: Fixed line items creation for different ticket types
✅ **Webhook Handling**: Improved payment completion processing and ticket generation
✅ **Error Handling**: Added comprehensive error handling and user feedback
✅ **UI Improvements**: Added success messages and better validation
✅ **Database Operations**: Fixed seat locking and ticket generation logic

## Testing the Complete Flow

1. **Create an Event**: Use the admin panel to create an event with tickets
2. **Select Tickets**: Go to the event page and select tickets
3. **Checkout**: Complete the checkout process with test card
4. **Payment**: Stripe will process the payment
5. **Webhook**: The webhook will generate tickets automatically
6. **Wallet**: Check your wallet to see the generated tickets

## Troubleshooting

### Common Issues:
- **"Invalid API key"**: Check that your Stripe keys are correct
- **"Webhook signature verification failed"**: Ensure webhook secret is correct
- **"No seat locks found"**: Check that seats are properly locked during checkout
- **Tickets not appearing**: Verify webhook is receiving and processing events

### Debug Steps:
1. Check browser console for errors
2. Check server logs for API errors
3. Verify Stripe webhook events in dashboard
4. Check database for created orders and tickets

## Security Notes

- Never commit real API keys to version control
- Use test keys for development
- Switch to live keys only for production
- Keep webhook secrets secure
- Monitor webhook events for security

## Next Steps

Once Stripe is properly configured:
1. Test the complete payment flow
2. Verify ticket generation works
3. Test seat selection and locking
4. Validate QR code generation
5. Test ticket validation system
