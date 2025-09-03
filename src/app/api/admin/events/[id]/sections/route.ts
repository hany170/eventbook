import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

// Force dynamic rendering
export const dynamic = 'force-dynamic';

const sectionSchema = z.object({
  name: z.string().min(1, "Section name is required"),
  rows: z.number().min(1, "Rows must be at least 1"),
  cols: z.number().min(1, "Columns must be at least 1"),
  priceAdjCents: z.number().default(0), // Price adjustment from base event price
  startRow: z.number().default(1), // Starting row number
  startCol: z.number().default(1)  // Starting column number
});

const createSectionsSchema = z.object({
  sections: z.array(sectionSchema)
});

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    // Check if user has ADMIN role
    if (session.user.role !== "ADMIN") {
      return NextResponse.json(
        { error: "Insufficient permissions" },
        { status: 403 }
      );
    }

    const { id } = await params;
    // Check if event exists and belongs to the admin
    const event = await prisma.event.findUnique({
      where: { id }
    });

    if (!event) {
      return NextResponse.json(
        { error: "Event not found" },
        { status: 404 }
      );
    }

    if (event.organizerId !== session.user.id) {
      return NextResponse.json(
        { error: "You can only manage your own events" },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { sections } = createSectionsSchema.parse(body);

    // Delete existing seats for this event
    await prisma.seat.deleteMany({
      where: { eventId: id }
    });

    // Create new seats
    const seats = [];
    for (const section of sections) {
      for (let row = 0; row < section.rows; row++) {
        for (let col = 0; col < section.cols; col++) {
          const rowLabel = String.fromCharCode(65 + section.startRow + row - 1); // A, B, C, etc.
          const colLabel = (section.startCol + col).toString();
          const label = `${rowLabel}${colLabel}`;
          
          seats.push({
            eventId: id,
            label,
            section: section.name,
            priceCents: section.priceAdjCents,
            status: "AVAILABLE" as const
          });
        }
      }
    }

    if (seats.length > 0) {
      await prisma.seat.createMany({
        data: seats
      });
    }

    return NextResponse.json({
      message: "Sections and seats created successfully",
      seatsCreated: seats.length
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Validation failed", details: error.issues },
        { status: 400 }
      );
    }

    console.error("Sections creation error:", error);
    return NextResponse.json(
      { error: "Failed to create sections" },
      { status: 500 }
    );
  }
}
