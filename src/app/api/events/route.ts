import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get("category");
    const city = searchParams.get("city");
    const from = searchParams.get("from");
    const to = searchParams.get("to");
    const text = searchParams.get("text");
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "12");
    const skip = (page - 1) * limit;

    // Build filter conditions
    const where: any = {
      published: true,
      endAt: {
        gte: new Date(), // Only future events
      }
    };

    if (category) {
      where.category = category;
    }

    if (city) {
      where.venueCity = {
        contains: city,
        mode: "insensitive"
      };
    }

    if (from) {
      where.startAt = {
        ...where.startAt,
        gte: new Date(from)
      };
    }

    if (to) {
      where.startAt = {
        ...where.startAt,
        lte: new Date(to)
      };
    }

    if (text) {
      where.OR = [
        { title: { contains: text, mode: "insensitive" } },
        { description: { contains: text, mode: "insensitive" } },
        { venueName: { contains: text, mode: "insensitive" } }
      ];
    }

    // Get events with pagination
    const [events, total] = await Promise.all([
      prisma.event.findMany({
        where,
        include: {
          organizer: {
            select: {
              name: true
            }
          },
          _count: {
            select: {
              orders: true
            }
          }
        },
        orderBy: {
          startAt: "asc"
        },
        skip,
        take: limit
      }),
      prisma.event.count({ where })
    ]);

    return NextResponse.json({
      events,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error: any) {
    console.error("Events fetch error:", error);
    
    // Handle specific Prisma errors
    if (error.code === 'P2010') {
      return NextResponse.json(
        { 
          error: "Database connection failed",
          message: "Unable to connect to the database. Please check your connection settings."
        },
        { status: 503 }
      );
    }
    
    if (error.message?.includes('Server selection timeout')) {
      return NextResponse.json(
        { 
          error: "Database timeout",
          message: "Database connection timed out. Please try again later."
        },
        { status: 503 }
      );
    }
    
    return NextResponse.json(
      { 
        error: "Failed to fetch events",
        message: "An unexpected error occurred while fetching events."
      },
      { status: 500 }
    );
  }
}
