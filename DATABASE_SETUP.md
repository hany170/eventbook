# Database Setup Guide

## Current Issue
Your application is experiencing MongoDB connection timeouts. The error indicates that Prisma cannot connect to your MongoDB Atlas cluster.

## Solution Steps

### 1. Create Environment File
Create a `.env.local` file in your project root with the following content:

```env
# Database
MONGODB_URI="mongodb+srv://username:password@cluster.mongodb.net/eventbook?retryWrites=true&w=majority"

# NextAuth.js
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="your-secret-key-here"

# OAuth Providers (if using Google OAuth)
GOOGLE_CLIENT_ID="your-google-client-id"
GOOGLE_CLIENT_SECRET="your-google-client-secret"

# Stripe (if using payments)
STRIPE_PUBLISHABLE_KEY="pk_test_..."
STRIPE_SECRET_KEY="sk_test_..."
STRIPE_WEBHOOK_SECRET="whsec_..."
```

### 2. Get Your MongoDB Connection String

#### Option A: MongoDB Atlas (Recommended)
1. Go to [MongoDB Atlas](https://cloud.mongodb.com/)
2. Sign in to your account
3. Select your cluster
4. Click "Connect" → "Connect your application"
5. Copy the connection string
6. Replace `<password>` with your database user password
7. Replace `<dbname>` with `eventbook`

#### Option B: Local MongoDB
If you want to use a local MongoDB instance:
```env
MONGODB_URI="mongodb://localhost:27017/eventbook"
```

### 3. MongoDB Atlas Network Access
If using MongoDB Atlas, ensure your IP address is whitelisted:
1. Go to MongoDB Atlas → Network Access
2. Add your current IP address (or use 0.0.0.0/0 for development)
3. Make sure the database user has read/write permissions

### 4. Database User Permissions
Ensure your MongoDB user has the following permissions:
- `readWrite` on the `eventbook` database
- Or create a user with `dbAdmin` role for full access

### 5. Test the Connection
After setting up the environment variables:

1. Restart your development server:
   ```bash
   npm run dev
   ```

2. Check the console for connection status messages:
   - ✅ "Database connected successfully" - Connection working
   - ❌ Error messages - Follow the troubleshooting steps below

### 6. Generate Prisma Client
If this is your first time setting up the database:
```bash
npx prisma generate
npx prisma db push
```

### 7. Seed the Database (Optional)
If you have seed data:
```bash
npm run seed
```

## Troubleshooting

### Common Issues:

1. **"MONGODB_URI environment variable is not set"**
   - Make sure you created `.env.local` file in the project root
   - Restart your development server after creating the file

2. **"Server selection timeout"**
   - Check your internet connection
   - Verify MongoDB Atlas cluster is running
   - Ensure your IP is whitelisted in Network Access
   - Try using a different connection string format

3. **"Authentication failed"**
   - Verify username and password in connection string
   - Check if the database user exists and has correct permissions

4. **"Database not found"**
   - The database will be created automatically when you first run the application
   - Make sure the database name in the connection string is correct

### Connection String Examples:

**MongoDB Atlas:**
```
mongodb+srv://username:password@cluster0.xxxxx.mongodb.net/eventbook?retryWrites=true&w=majority
```

**Local MongoDB:**
```
mongodb://localhost:27017/eventbook
```

**With additional options:**
```
mongodb+srv://username:password@cluster0.xxxxx.mongodb.net/eventbook?retryWrites=true&w=majority&maxPoolSize=20&serverSelectionTimeoutMS=5000&socketTimeoutMS=45000
```

## Next Steps
Once the database connection is working:
1. Your application should start without connection errors
2. You can access the events API at `/api/events`
3. Consider setting up proper error monitoring for production
