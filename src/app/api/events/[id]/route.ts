import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// Force dynamic rendering
export const dynamic = 'force-dynamic';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const event = await prisma.event.findUnique({
      where: { id },
      include: {
        organizer: {
          select: {
            name: true,
            email: true
          }
        },
        seats: {
          where: {
            status: "AVAILABLE"
          },
          orderBy: [
            { section: "asc" },
            { label: "asc" }
          ]
        },
        _count: {
          select: {
            orders: {
              where: {
                status: "PAID"
              }
            }
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

    // Calculate available GA tickets
    const soldTickets = await prisma.ticket.count({
      where: {
        eventId: id,
        seatId: null // GA tickets don't have seats
      }
    });

    const availableGA = event.capacity - soldTickets;

    return NextResponse.json({
      ...event,
      availableGA,
      hasSeating: event.seats.length > 0
    });
  } catch (error) {
    console.error("Event fetch error:", error);
    return NextResponse.json(
      { error: "Failed to fetch event" },
      { status: 500 }
    );
  }
}
