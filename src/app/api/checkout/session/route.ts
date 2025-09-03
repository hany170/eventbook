import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { stripe } from "@/lib/stripe";
import { z } from "zod";

const checkoutSchema = z.object({
  eventId: z.string(),
  type: z.enum(["GA", "SEATED"]),
  qty: z.number().min(1).optional(),
  seatIds: z.array(z.string()).optional(),
});

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { eventId, type, qty, seatIds } = checkoutSchema.parse(body);

    // Get event details
    const event = await prisma.event.findUnique({
      where: { id: eventId },
      include: {
        seats: {
          where: {
            id: { in: seatIds || [] }
          }
        }
      }
    });

    if (!event) {
      return NextResponse.json(
        { error: "Event not found" },
        { status: 404 }
      );
    }

    if (!event.published) {
      return NextResponse.json(
        { error: "Event is not published" },
        { status: 400 }
      );
    }

    let amountCents = 0;
    let orderData: any = {
      userId: session.user.id,
      eventId,
      status: "PENDING",
    };

    if (type === "GA") {
      if (!qty || qty < 1) {
        return NextResponse.json(
          { error: "Quantity is required for GA tickets" },
          { status: 400 }
        );
      }

      // Check GA availability
      const soldTickets = await prisma.ticket.count({
        where: {
          eventId,
          seatId: null
        }
      });

      if (soldTickets + qty > event.capacity) {
        return NextResponse.json(
          { error: "Not enough GA tickets available" },
          { status: 400 }
        );
      }

      amountCents = event.priceCents * qty;
      orderData.qty = qty;
      orderData.amountTotalCents = amountCents;
    } else {
      // SEATED
      if (!seatIds || seatIds.length === 0) {
        return NextResponse.json(
          { error: "Seat selection is required for seated tickets" },
          { status: 400 }
        );
      }

      // Check seat availability and calculate total
      const seats = await prisma.seat.findMany({
        where: {
          id: { in: seatIds },
          status: "AVAILABLE"
        }
      });

      if (seats.length !== seatIds.length) {
        return NextResponse.json(
          { error: "Some selected seats are not available" },
          { status: 400 }
        );
      }

      // Calculate total price
      amountCents = seats.reduce((total, seat) => {
        return total + (seat.priceCents || event.priceCents);
      }, 0);

      orderData.qty = seatIds.length;
      orderData.amountTotalCents = amountCents;

      // Lock seats temporarily
      await prisma.seat.updateMany({
        where: { id: { in: seatIds } },
        data: { status: "LOCKED" }
      });

      // Create seat locks
      const seatLocks = seatIds.map(seatId => ({
        seatId,
        userId: session.user.id,
        expiresAt: new Date(Date.now() + 10 * 60 * 1000) // 10 minutes
      }));

      await prisma.seatLock.createMany({
        data: seatLocks
      });
    }

    // Create order
    const order = await prisma.order.create({
      data: orderData
    });

    // Create line items for Stripe
    let lineItems: any[] = [];

    if (type === "GA") {
      // Single line item for GA tickets
      lineItems.push({
        price_data: {
          currency: event.currencyCode.toLowerCase(),
          product_data: {
            name: `${event.title} - General Admission`,
            description: `General Admission ticket for ${event.title}`,
          },
          unit_amount: event.priceCents,
        },
        quantity: qty,
      });
    } else {
      // Individual line items for each seat
      const seats = await prisma.seat.findMany({
        where: {
          id: { in: seatIds },
          status: "AVAILABLE"
        }
      });

      for (const seat of seats) {
        lineItems.push({
          price_data: {
            currency: event.currencyCode.toLowerCase(),
            product_data: {
              name: `${event.title} - Seat ${seat.label}`,
              description: `Seat ${seat.label} in ${seat.section || 'General'} section for ${event.title}`,
            },
            unit_amount: seat.priceCents || event.priceCents,
          },
          quantity: 1,
        });
      }
    }

    // Create Stripe checkout session
    const stripeSession = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      line_items: lineItems,
      mode: "payment",
      success_url: `${request.nextUrl.origin}/wallet?success=true`,
      cancel_url: `${request.nextUrl.origin}/events/${eventId}?cancelled=true`,
      metadata: {
        orderId: order.id,
        eventId,
        type,
      },
    });

    return NextResponse.json({
      sessionId: stripeSession.id,
      url: stripeSession.url,
      orderId: order.id
    });
  } catch (error) {
    console.error("Checkout error:", error);
    return NextResponse.json(
      { error: "Failed to create checkout session" },
      { status: 500 }
    );
  }
}
