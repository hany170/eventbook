# EventBook - Event Ticket Booking System

A modern, production-ready event ticket booking application built with Next.js, TypeScript, and Prisma.

## Features

- 🎫 **Event Management**: Create, edit, and publish events with detailed information
- 🎭 **Flexible Ticketing**: Support for both General Admission and Seated events
- 💳 **Secure Payments**: Stripe integration for payment processing
- 📱 **Digital Tickets**: QR codes and barcodes for easy validation
- 🔐 **Role-Based Access**: Admin, Validator, and User roles with proper permissions
- 📱 **Responsive UI**: Modern, mobile-friendly interface built with Tailwind CSS
- 🎨 **Dark Mode**: Built-in dark/light theme support

## Tech Stack

- **Frontend**: Next.js 15, React 19, TypeScript
- **Styling**: Tailwind CSS, shadcn/ui components
- **Database**: MongoDB with Prisma ORM
- **Authentication**: NextAuth.js with JWT
- **Payments**: Stripe Checkout
- **QR Codes**: qrcode library
- **Icons**: Lucide React

## Prerequisites

- Node.js 18+ 
- MongoDB database (local or MongoDB Atlas)
- Stripe account for payments

## Quick Start

### 1. Clone and Install

```bash
git clone <your-repo-url>
cd eventbook
npm install
```

### 2. Environment Setup

Create a `.env.local` file in the root directory:

```env
# Database
MONGODB_URI="mongodb://localhost:27017/eventbook"

# Authentication
NEXTAUTH_SECRET="your-nextauth-secret-key-here"
NEXTAUTH_URL="http://localhost:3000"

# Stripe
STRIPE_SECRET_KEY="sk_test_your_stripe_secret_key_here"
STRIPE_WEBHOOK_SECRET="whsec_your_stripe_webhook_secret_here"
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY="pk_test_your_stripe_publishable_key_here"
```

### 3. Database Setup

```bash
# Generate Prisma client
npx prisma generate

# Push schema to database
npx prisma db push

# (Optional) Open Prisma Studio
npx prisma studio
```

### 4. Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Project Structure

```
src/
├── app/                    # Next.js App Router
│   ├── api/               # API routes
│   │   ├── auth/          # Authentication endpoints
│   │   ├── events/        # Event management
│   │   ├── admin/         # Admin operations
│   │   ├── checkout/      # Payment processing
│   │   ├── stripe/        # Stripe webhooks
│   │   ├── tickets/       # Ticket validation
│   │   └── wallet/        # User tickets
│   ├── auth/              # Auth pages (signin/signup)
│   ├── events/            # Event browsing
│   ├── admin/             # Admin dashboard
│   ├── validator/         # Ticket validation
│   ├── wallet/            # User ticket wallet
│   └── checkout/          # Booking process
├── components/             # Reusable UI components
│   ├── ui/                # Base UI components
│   ├── providers/         # Context providers
│   └── navigation.tsx     # Main navigation
└── lib/                   # Utility functions
    ├── auth.ts            # NextAuth configuration
    ├── prisma.ts          # Database client
    ├── stripe.ts          # Stripe configuration
    └── utils.ts           # Helper functions
```

## Key Features Explained

### Event Management
- **Admin Dashboard**: Create, edit, and manage events
- **Seating Configuration**: Set up sections and individual seats
- **Publishing Control**: Toggle event visibility
- **Capacity Management**: Track available tickets

### Ticketing System
- **General Admission**: Simple quantity-based booking
- **Seated Events**: Interactive seat selection
- **Price Tiers**: Different pricing per section
- **Inventory Tracking**: Real-time availability updates

### Payment Flow
1. User selects tickets/seats
2. Creates Stripe Checkout Session
3. Processes payment securely
4. Generates digital tickets on success
5. Updates inventory automatically

### Ticket Validation
- **QR Code Scanning**: Quick validation
- **Manual Entry**: Code-based validation
- **Real-time Updates**: Immediate status changes
- **Audit Trail**: Track all validations

## API Endpoints

### Public
- `GET /api/events` - List events with filters
- `GET /api/events/[id]` - Get event details

### Authentication Required
- `POST /api/auth/register` - User registration
- `POST /api/checkout/session` - Create payment session
- `GET /api/wallet` - User's tickets

### Admin Only
- `POST /api/admin/events` - Create events
- `PATCH /api/admin/events/[id]` - Update events
- `POST /api/admin/events/[id]/sections` - Manage seating
- `GET /api/admin/orders` - View all orders

### Validator Only
- `POST /api/tickets/validate` - Validate tickets

## Database Schema

The application uses MongoDB with the following main models:

- **User**: Authentication and role management
- **Event**: Event details and configuration
- **Order**: Booking transactions
- **Ticket**: Individual ticket instances
- **Seat**: Seating configuration for events
- **SeatLock**: Temporary seat holds during booking

## Deployment

### Vercel (Recommended)
1. Connect your GitHub repository
2. Set environment variables
3. Deploy automatically

### Other Platforms
- Ensure MongoDB connection string is accessible
- Set all required environment variables
- Configure Stripe webhook endpoints

## Stripe Setup

1. Create a Stripe account
2. Get your API keys from the dashboard
3. Set up webhook endpoints:
   - URL: `https://yourdomain.com/api/stripe/webhook`
   - Events: `checkout.session.completed`
4. Update environment variables

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

This project is licensed under the MIT License.

## Support

For support and questions:
- Create an issue in the repository
- Check the documentation
- Review the code examples

## Roadmap

- [ ] Email ticket delivery
- [ ] Advanced reporting
- [ ] Mobile app
- [ ] Multi-language support
- [ ] Advanced analytics
- [ ] Social media integration
