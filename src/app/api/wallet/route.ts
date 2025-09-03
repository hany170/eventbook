import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const tickets = await prisma.ticket.findMany({
      where: {
        ownerId: session.user.id
      },
      include: {
        event: {
          select: {
            title: true,
            startAt: true,
            endAt: true,
            venueName: true,
            venueCity: true,
            coverImageUrl: true
          }
        },
        seat: {
          select: {
            label: true,
            section: true
          }
        }
      },
      orderBy: {
        issuedAt: "desc"
      }
    });

    return NextResponse.json({ tickets });
  } catch (error) {
    console.error("Wallet fetch error:", error);
    return NextResponse.json(
      { error: "Failed to fetch tickets" },
      { status: 500 }
    );
  }
}
