import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/auth";
import { prisma } from "@/lib/prisma";
import { buildPublicUrl, validateImageDimensions } from "@/lib/s3";

export async function POST(request: NextRequest) {
  try {
    // Get current session
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 }
      );
    }

    // Parse request body
    const body = await request.json();
    const { 
      objectKey, 
      mimeType, 
      sizeBytes, 
      width, 
      height, 
      scope, 
      entityId 
    } = body;

    // Validate required fields
    if (!objectKey || !mimeType || !sizeBytes || !scope || !entityId) {
      return NextResponse.json(
        { error: "Missing required fields: objectKey, mimeType, sizeBytes, scope, entityId" },
        { status: 400 }
      );
    }

    // Support providers and events scopes
    if (scope !== "providers" && scope !== "events") {
      return NextResponse.json(
        { error: "Invalid scope. Only 'providers' and 'events' are supported" },
        { status: 400 }
      );
    }

    // Validate object key format (should match our generated pattern)
    const entityIdNum = parseInt(entityId);
    if (isNaN(entityIdNum)) {
      return NextResponse.json(
        { error: `Invalid ${scope === "providers" ? "provider" : "event"} ID` },
        { status: 400 }
      );
    }

    const expectedPrefix = scope === "providers"
      ? `uploads/providers/${entityId}/`
      : `uploads/events/${entityId}/`;
    
    if (!objectKey.startsWith(expectedPrefix)) {
      return NextResponse.json(
        { error: "Invalid object key format" },
        { status: 400 }
      );
    }

    // Basic sanity checks
    if (sizeBytes <= 0 || sizeBytes > 5 * 1024 * 1024) {
      return NextResponse.json(
        { error: "Invalid file size" },
        { status: 400 }
      );
    }

    // Validate dimensions if provided
    if (width && height) {
      const dimensionValidation = validateImageDimensions(width, height);
      if (!dimensionValidation.valid) {
        return NextResponse.json(
          { error: "Invalid image dimensions" },
          { status: 400 }
        );
      }
    }

    // Verify user has permission to complete upload for this entity
    const isAdmin = session.user.role === "admin";
    let hasPermission = isAdmin;

    if (!isAdmin) {
      if (scope === "providers") {
        // Check if user owns this trainer profile
        const trainer = await prisma.trainer.findFirst({
          where: {
            trainerId: entityIdNum,
            email: session.user.email!
          }
        });
        hasPermission = !!trainer;
      } else if (scope === "events") {
        // Check if user owns this event
        const event = await prisma.event.findFirst({
          where: {
            eventId: entityIdNum,
            trainer: {
              email: session.user.email!
            }
          }
        });
        hasPermission = !!event;
      }
    }

    if (!hasPermission) {
      return NextResponse.json(
        { error: `You don't have permission to complete upload for this ${scope === "providers" ? "provider" : "event"}` },
        { status: 403 }
      );
    }

    // Build public URL
    const publicUrl = buildPublicUrl(objectKey);

    // Create File record and update entity in a transaction
    const result = await prisma.$transaction(async (tx) => {
      // Create File record
      const file = await tx.file.create({
        data: {
          key: objectKey,
          url: publicUrl,
          mimeType,
          sizeBytes,
          width: width || null,
          height: height || null,
        }
      });

      if (scope === "providers") {
        // Update Trainer's avatarFileId
        const updatedTrainer = await tx.trainer.update({
          where: { trainerId: entityIdNum },
          data: { avatarFileId: file.id },
          include: {
            avatarFile: true
          }
        });
        return { file, trainer: updatedTrainer };
      } else if (scope === "events") {
        // Create EventImage record
        const eventImage = await tx.eventImage.create({
          data: {
            eventId: entityIdNum,
            fileId: file.id,
            sortOrder: 0, // Will be updated when we implement ordering
            isMain: false // Will be set when user selects main image
          }
        });
        return { file, eventImage };
      }

      return { file };
    });

    // Log successful upload completion
    console.log(`Upload completed: key=${objectKey}, size=${sizeBytes}, ${scope === "providers" ? "providerId" : "eventId"}=${entityIdNum}, userId=${session.user.id}`);

    return NextResponse.json({
      success: true,
      file: {
        id: result.file.id,
        url: result.file.url,
        mimeType: result.file.mimeType,
        sizeBytes: result.file.sizeBytes,
        width: result.file.width,
        height: result.file.height,
      },
      publicUrl: result.file.url
    });

  } catch (error) {
    console.error("Error completing upload:", error);
    
    // Handle specific Prisma errors
    if (error instanceof Error) {
      if (error.message.includes("Unique constraint")) {
        return NextResponse.json(
          { error: "File with this key already exists" },
          { status: 409 }
        );
      }
      
      if (error.message.includes("Foreign key constraint")) {
        return NextResponse.json(
          { error: "Provider not found" },
          { status: 404 }
        );
      }
    }

    return NextResponse.json(
      { error: "Failed to complete upload" },
      { status: 500 }
    );
  }
}

// Handle OPTIONS for CORS
export async function OPTIONS() {
  return new NextResponse(null, {
    status: 200,
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type, Authorization",
    },
  });
}