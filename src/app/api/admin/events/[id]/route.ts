import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

// Force dynamic rendering
export const dynamic = 'force-dynamic';

const updateEventSchema = z.object({
  title: z.string().min(1, "Title is required").optional(),
  description: z.string().optional(),
  category: z.string().min(1, "Category is required").optional(),
  startAt: z.string().datetime("Invalid start date").optional(),
  endAt: z.string().datetime("Invalid end date").optional(),
  venueName: z.string().min(1, "Venue name is required").optional(),
  venueCity: z.string().min(1, "Venue city is required").optional(),
  coverImageUrl: z.string().url("Invalid cover image URL").optional(),
  currencyCode: z.string().optional(),
  priceCents: z.number().min(0, "Price must be non-negative").optional(),
  capacity: z.number().min(1, "Capacity must be at least 1").optional(),
  published: z.boolean().optional()
});

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Check if we're in build mode
    if (process.env.NODE_ENV === 'production' && !process.env.MONGODB_URI) {
      return NextResponse.json(
        { error: "Database not configured" },
        { status: 503 }
      );
    }

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
    const body = await request.json();
    const updateData = updateEventSchema.parse(body);

    // Convert date strings to Date objects if provided
    const processedData: any = { ...updateData };
    if (updateData.startAt) {
      processedData.startAt = new Date(updateData.startAt);
    }
    if (updateData.endAt) {
      processedData.endAt = new Date(updateData.endAt);
    }

    // Update event
    const event = await prisma.event.update({
      where: { id },
      data: processedData
    });

    return NextResponse.json({
      message: "Event updated successfully",
      event
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Validation failed", details: error.issues },
        { status: 400 }
      );
    }

    console.error("Event update error:", error);
    return NextResponse.json(
      { error: "Failed to update event" },
      { status: 500 }
    );
  }
}
