import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const validateSchema = z.object({
  code: z.string().min(1, "Ticket code is required")
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

    // Check if user has VALIDATOR role
    if (session.user.role !== "VALIDATOR" && session.user.role !== "ADMIN") {
      return NextResponse.json(
        { error: "Insufficient permissions" },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { code } = validateSchema.parse(body);

    // Find ticket by code
    const ticket = await prisma.ticket.findUnique({
      where: { code },
      include: {
        event: {
          select: {
            title: true,
            startAt: true,
            endAt: true,
            venueName: true
          }
        },
        seat: {
          select: {
            label: true,
            section: true
          }
        }
      }
    });

    if (!ticket) {
      return NextResponse.json(
        { 
          ok: false, 
          code: "INVALID_TICKET",
          message: "Ticket not found" 
        },
        { status: 404 }
      );
    }

    // Check if ticket is already scanned
    if (ticket.validatedAt) {
      return NextResponse.json({
        ok: false,
        code: "ALREADY_SCANNED",
        message: "Ticket has already been scanned",
        ticket: {
          eventTitle: ticket.event.title,
          seatLabel: ticket.seat?.label,
          scannedAt: ticket.validatedAt
        }
      });
    }

    // Check if event is within valid time window (3 hours before start to 3 hours after end)
    const now = new Date();
    const eventStart = new Date(ticket.event.startAt);
    const eventEnd = new Date(ticket.event.endAt);
    const validFrom = new Date(eventStart.getTime() - 3 * 60 * 60 * 1000); // 3 hours before
    const validTo = new Date(eventEnd.getTime() + 3 * 60 * 60 * 1000); // 3 hours after

    if (now < validFrom || now > validTo) {
      return NextResponse.json({
        ok: false,
        code: "EVENT_NOT_ACTIVE",
        message: "Event is not currently active for validation",
        ticket: {
          eventTitle: ticket.event.title,
          seatLabel: ticket.seat?.label
        }
      });
    }

    // Mark ticket as scanned
    await prisma.ticket.update({
      where: { id: ticket.id },
      data: {
        validatedAt: now
      }
    });

    return NextResponse.json({
      ok: true,
      message: "Ticket validated successfully",
      ticket: {
        eventTitle: ticket.event.title,
        seatLabel: ticket.seat?.label,
        scannedAt: now
      }
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Validation failed", details: error.issues },
        { status: 400 }
      );
    }

    console.error("Ticket validation error:", error);
    return NextResponse.json(
      { error: "Failed to validate ticket" },
      { status: 500 }
    );
  }
}
