# Google OAuth Setup Guide

## Environment Variables Required

Create a `.env.local` file in your project root with the following variables:

```env
# NextAuth Configuration
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your_generated_secret_here

# Google OAuth
GOOGLE_CLIENT_ID=your_google_client_id_here
GOOGLE_CLIENT_SECRET=your_google_client_secret_here
```

## How to Get Google OAuth Credentials

### 1. Go to Google Cloud Console
- Visit [https://console.cloud.google.com/](https://console.cloud.google.com/)
- Create a new project or select an existing one

### 2. Enable Google+ API
- Go to "APIs & Services" > "Library"
- Search for "Google+ API" and enable it

### 3. Create OAuth 2.0 Credentials
- Go to "APIs & Services" > "Credentials"
- Click "Create Credentials" > "OAuth 2.0 Client IDs"
- Set application type to "Web application"

### 4. Configure Authorized Redirect URIs
Add these redirect URIs:
- `http://localhost:3000/api/auth/callback/google` (for development)
- `https://yourdomain.com/api/auth/callback/google` (for production)

### 5. Copy Credentials
- Copy the Client ID and Client Secret
- Paste them into your `.env.local` file

## Generate NextAuth Secret

Run this command to generate a secure secret:

```bash
openssl rand -base64 32
```

Or use Node.js:

```bash
node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"
```

## What's Already Implemented

✅ Google OAuth provider added to NextAuth configuration
✅ Google sign-in button on signin page
✅ Google sign-up button on signup page
✅ Proper error handling for OAuth flows
✅ Prisma adapter configured for OAuth accounts

## Testing

1. Start your development server: `npm run dev`
2. Go to `/auth/signin` or `/auth/signup`
3. Click "Continue with Google"
4. Complete the Google OAuth flow

## Troubleshooting

- Make sure all environment variables are set correctly
- Check that Google+ API is enabled
- Verify redirect URIs match exactly
- Ensure your `.env.local` file is not committed to git
