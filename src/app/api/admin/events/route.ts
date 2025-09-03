import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

// Force dynamic rendering
export const dynamic = 'force-dynamic';

const createEventSchema = z.object({
  title: z.string().min(1, "Title is required"),
  description: z.string().optional(),
  category: z.string().min(1, "Category is required"),
  startAt: z.string().datetime("Invalid start date"),
  endAt: z.string().datetime("Invalid end date"),
  venueName: z.string().min(1, "Venue name is required"),
  venueCity: z.string().min(1, "Venue city is required"),
  coverImageUrl: z.string().url("Invalid cover image URL").optional(),
  currencyCode: z.string().default("USD"),
  priceCents: z.number().min(0, "Price must be non-negative"),
  capacity: z.number().min(1, "Capacity must be at least 1"),
  published: z.boolean().default(false),
  slug: z.string().min(1, "Slug is required").regex(/^[a-z0-9-]+$/, "Slug must contain only lowercase letters, numbers, and hyphens")
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

    // Check if user has ADMIN role
    if (session.user.role !== "ADMIN") {
      return NextResponse.json(
        { error: "Insufficient permissions" },
        { status: 403 }
      );
    }

    const body = await request.json();
    const eventData = createEventSchema.parse(body);

    // Check if slug is unique
    const existingEvent = await prisma.event.findUnique({
      where: { slug: eventData.slug }
    });

    if (existingEvent) {
      return NextResponse.json(
        { error: "Event with this slug already exists" },
        { status: 400 }
      );
    }

    // Create event
    const event = await prisma.event.create({
      data: {
        ...eventData,
        organizerId: session.user.id,
        startAt: new Date(eventData.startAt),
        endAt: new Date(eventData.endAt)
      }
    });

    return NextResponse.json(
      { message: "Event created successfully", event },
      { status: 201 }
    );
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Validation failed", details: error.issues },
        { status: 400 }
      );
    }

    console.error("Event creation error:", error);
    return NextResponse.json(
      { error: "Failed to create event" },
      { status: 500 }
    );
  }
}
