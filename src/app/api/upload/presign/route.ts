import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/auth";
import { prisma } from "@/lib/prisma";
import {
  generatePresignedPost,
  generateAvatarKey,
  generateEventImageKey,
  validateUploadParams,
  checkRateLimit,
  ALLOWED_MIME_TYPES,
  MAX_FILE_SIZE
} from "@/lib/s3";

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
    const { filename, contentType, scope, entityId, fileSize } = body;

    // Validate required fields
    if (!filename || !contentType || !scope || !entityId) {
      return NextResponse.json(
        { error: "Missing required fields: filename, contentType, scope, entityId" },
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

    // Validate upload parameters
    const validation = validateUploadParams(filename, contentType, fileSize || 0);
    if (!validation.valid) {
      return NextResponse.json(
        { error: validation.error },
        { status: 400 }
      );
    }

    // Check rate limiting
    if (!checkRateLimit(session.user.id)) {
      return NextResponse.json(
        { error: "Too many upload attempts. Please try again later." },
        { status: 429 }
      );
    }

    // Verify user has permission to upload for this entity
    const entityIdNum = parseInt(entityId);
    if (isNaN(entityIdNum)) {
      return NextResponse.json(
        { error: `Invalid ${scope === "providers" ? "provider" : "event"} ID` },
        { status: 400 }
      );
    }

    // Check if user is admin or owns the entity
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
        { error: `You don't have permission to upload for this ${scope === "providers" ? "provider" : "event"}` },
        { status: 403 }
      );
    }

    // Generate unique object key
    const objectKey = scope === "providers"
      ? generateAvatarKey(entityId, filename)
      : generateEventImageKey(entityId, filename);

    // Generate presigned POST URL
    const presignedPost = await generatePresignedPost(
      objectKey,
      contentType,
      fileSize || MAX_FILE_SIZE
    );

    // Log the presign request
    console.log(`Presign request: ${scope}Id=${entityId}, userId=${session.user.id}, mime=${contentType}, size=${fileSize}`);

    return NextResponse.json({
      presignedPost,
      objectKey,
      maxFileSize: MAX_FILE_SIZE,
      allowedMimeTypes: ALLOWED_MIME_TYPES,
      expiresIn: 300 // 5 minutes
    });

  } catch (error) {
    console.error("Error generating presigned URL:", error);
    return NextResponse.json(
      { error: "Failed to generate upload URL" },
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