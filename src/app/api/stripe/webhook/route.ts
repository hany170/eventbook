import { NextRequest, NextResponse } from "next/server";
import { headers } from "next/headers";
import { stripe } from "@/lib/stripe";
import { prisma } from "@/lib/prisma";
import QRCode from "qrcode";

export async function POST(request: NextRequest) {
  const body = await request.text();
  const headersList = await headers();
  const signature = headersList.get("stripe-signature");

  if (!signature || !process.env.STRIPE_WEBHOOK_SECRET) {
    return NextResponse.json(
      { error: "Missing signature or webhook secret" },
      { status: 400 }
    );
  }

  let event;

  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET
    );
  } catch (err) {
    console.error("Webhook signature verification failed:", err);
    return NextResponse.json(
      { error: "Invalid signature" },
      { status: 400 }
    );
  }

  if (event.type === "checkout.session.completed") {
    const session = event.data.object as any;
    const { orderId, eventId, type } = session.metadata;

    try {
      // Get the order
      const order = await prisma.order.findUnique({
        where: { id: orderId },
        include: {
          event: true
        }
      });

      if (!order) {
        console.error("Order not found:", orderId);
        return NextResponse.json(
          { error: "Order not found" },
          { status: 404 }
        );
      }

      // Update order status
      await prisma.order.update({
        where: { id: orderId },
        data: {
          status: "PAID",
          stripePaymentIntentId: session.payment_intent
        }
      });

      if (type === "GA") {
        // Generate GA tickets
        const tickets = [];
        for (let i = 0; i < order.qty; i++) {
          const serialNo = `${orderId}-GA-${i + 1}`;
          const code = `${eventId}-${serialNo}-${Date.now()}`;
          
          // Generate QR code
          const qrDataUrl = await QRCode.toDataURL(code);
          
          // Generate barcode (simplified for now)
          const barcodeDataUrl = `data:image/svg+xml;base64,${Buffer.from(`<svg width="200" height="100" xmlns="http://www.w3.org/2000/svg"><text x="10" y="50" font-family="monospace" font-size="12">${code}</text></svg>`).toString('base64')}`;

          tickets.push({
            orderId: order.id,
            eventId: order.eventId,
            ownerId: order.userId,
            serialNo,
            qrJws: qrDataUrl,
            barcodeDataUrl,
            code
          });
        }

        await prisma.ticket.createMany({
          data: tickets
        });
      } else {
        // SEATED - get locked seats and generate tickets
        const seatLocks = await prisma.seatLock.findMany({
          where: {
            userId: order.userId,
            expiresAt: { gt: new Date() }
          },
          include: {
            seat: true
          }
        });

        if (seatLocks.length === 0) {
          console.error("No seat locks found for order:", orderId);
          return NextResponse.json(
            { error: "No seat locks found" },
            { status: 400 }
          );
        }

        const tickets = [];
        for (const seatLock of seatLocks) {
          const serialNo = `${orderId}-${seatLock.seat.label}`;
          const code = `${eventId}-${serialNo}-${Date.now()}`;
          
          // Generate QR code
          const qrDataUrl = await QRCode.toDataURL(code);
          
          // Generate barcode (simplified for now)
          const barcodeDataUrl = `data:image/svg+xml;base64,${Buffer.from(`<svg width="200" height="100" xmlns="http://www.w3.org/2000/svg"><text x="10" y="50" font-family="monospace" font-size="12">${code}</text></svg>`).toString('base64')}`;

          tickets.push({
            orderId: order.id,
            eventId: order.eventId,
            ownerId: order.userId,
            serialNo,
            qrJws: qrDataUrl,
            barcodeDataUrl,
            code,
            seatId: seatLock.seatId
          });
        }

        // Create all tickets first
        await prisma.ticket.createMany({
          data: tickets
        });

        // Then update seats and remove locks
        for (const seatLock of seatLocks) {
          // Mark seat as sold
          await prisma.seat.update({
            where: { id: seatLock.seatId },
            data: { status: "SOLD" }
          });

          // Remove seat lock
          await prisma.seatLock.delete({
            where: { id: seatLock.id }
          });
        }
      }

      return NextResponse.json({ received: true });
    } catch (error) {
      console.error("Error processing webhook:", error);
      return NextResponse.json(
        { error: "Failed to process webhook" },
        { status: 500 }
      );
    }
  }

  return NextResponse.json({ received: true });
}
