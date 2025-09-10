import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/auth";
import { prisma } from "@/lib/prisma";

// GET - Get all images for an event
export async function GET(
  request: NextRequest,
  { params }: { params: { eventId: string } }
) {
  try {
    const eventId = parseInt(params.eventId);
    if (isNaN(eventId)) {
      return NextResponse.json(
        { error: "Invalid event ID" },
        { status: 400 }
      );
    }

    const eventImages = await prisma.eventImage.findMany({
      where: { eventId },
      include: { file: true },
      orderBy: { sortOrder: "asc" }
    });

    return NextResponse.json({ images: eventImages });
  } catch (error) {
    console.error("Error fetching event images:", error);
    return NextResponse.json(
      { error: "Failed to fetch event images" },
      { status: 500 }
    );
  }
}

// POST - Add image to event or update image properties
export async function POST(
  request: NextRequest,
  { params }: { params: { eventId: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 }
      );
    }

    const eventId = parseInt(params.eventId);
    if (isNaN(eventId)) {
      return NextResponse.json(
        { error: "Invalid event ID" },
        { status: 400 }
      );
    }

    const body = await request.json();
    const { fileId, isMain, sortOrder } = body;

    // Verify user has permission to modify this event
    const isAdmin = session.user.role === "admin";
    let hasPermission = isAdmin;

    if (!isAdmin) {
      const event = await prisma.event.findFirst({
        where: {
          eventId,
          trainer: {
            email: session.user.email!
          }
        }
      });
      hasPermission = !!event;
    }

    if (!hasPermission) {
      return NextResponse.json(
        { error: "You don't have permission to modify this event" },
        { status: 403 }
      );
    }

    // If setting as main image, unset other main images first
    if (isMain) {
      await prisma.eventImage.updateMany({
        where: { eventId, isMain: true },
        data: { isMain: false }
      });
    }

    // Update or create the event image
    const eventImage = await prisma.eventImage.upsert({
      where: {
        eventId_fileId: {
          eventId,
          fileId
        }
      },
      update: {
        isMain: isMain || false,
        sortOrder: sortOrder || 0
      },
      create: {
        eventId,
        fileId,
        isMain: isMain || false,
        sortOrder: sortOrder || 0
      },
      include: { file: true }
    });

    return NextResponse.json({ eventImage });
  } catch (error) {
    console.error("Error updating event image:", error);
    return NextResponse.json(
      { error: "Failed to update event image" },
      { status: 500 }
    );
  }
}

// DELETE - Remove image from event
export async function DELETE(
  request: NextRequest,
  { params }: { params: { eventId: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 }
      );
    }

    const eventId = parseInt(params.eventId);
    if (isNaN(eventId)) {
      return NextResponse.json(
        { error: "Invalid event ID" },
        { status: 400 }
      );
    }

    const { searchParams } = new URL(request.url);
    const fileId = searchParams.get("fileId");

    if (!fileId) {
      return NextResponse.json(
        { error: "File ID is required" },
        { status: 400 }
      );
    }

    // Verify user has permission to modify this event
    const isAdmin = session.user.role === "admin";
    let hasPermission = isAdmin;

    if (!isAdmin) {
      const event = await prisma.event.findFirst({
        where: {
          eventId,
          trainer: {
            email: session.user.email!
          }
        }
      });
      hasPermission = !!event;
    }

    if (!hasPermission) {
      return NextResponse.json(
        { error: "You don't have permission to modify this event" },
        { status: 403 }
      );
    }

    // Remove the event image association
    await prisma.eventImage.delete({
      where: {
        eventId_fileId: {
          eventId,
          fileId
        }
      }
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error removing event image:", error);
    return NextResponse.json(
      { error: "Failed to remove event image" },
      { status: 500 }
    );
  }
}

// PUT - Reorder images
export async function PUT(
  request: NextRequest,
  { params }: { params: { eventId: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 }
      );
    }

    const eventId = parseInt(params.eventId);
    if (isNaN(eventId)) {
      return NextResponse.json(
        { error: "Invalid event ID" },
        { status: 400 }
      );
    }

    const body = await request.json();
    const { imageOrders } = body; // Array of { fileId, sortOrder }

    if (!Array.isArray(imageOrders)) {
      return NextResponse.json(
        { error: "imageOrders must be an array" },
        { status: 400 }
      );
    }

    // Verify user has permission to modify this event
    const isAdmin = session.user.role === "admin";
    let hasPermission = isAdmin;

    if (!isAdmin) {
      const event = await prisma.event.findFirst({
        where: {
          eventId,
          trainer: {
            email: session.user.email!
          }
        }
      });
      hasPermission = !!event;
    }

    if (!hasPermission) {
      return NextResponse.json(
        { error: "You don't have permission to modify this event" },
        { status: 403 }
      );
    }

    // Update sort orders in a transaction
    await prisma.$transaction(
      imageOrders.map(({ fileId, sortOrder }) =>
        prisma.eventImage.update({
          where: {
            eventId_fileId: {
              eventId,
              fileId
            }
          },
          data: { sortOrder }
        })
      )
    );

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error reordering event images:", error);
    return NextResponse.json(
      { error: "Failed to reorder event images" },
      { status: 500 }
    );
  }
}