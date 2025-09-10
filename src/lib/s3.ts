import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import { createPresignedPost } from "@aws-sdk/s3-presigned-post";

import { v4 as uuidv4 } from "uuid";

// S3 Configuration from environment variables
const s3Config = {
  region: process.env.S3_REGION || "us-east-1",
  endpoint: process.env.S3_ENDPOINT,
  credentials: {
    accessKeyId: process.env.S3_ACCESS_KEY_ID!,
    secretAccessKey: process.env.S3_SECRET_ACCESS_KEY!,
  },
  forcePathStyle: process.env.S3_FORCE_PATH_STYLE === "true",
};

const bucketName = process.env.S3_BUCKET!;
const publicBaseUrl = process.env.NEXT_PUBLIC_S3_PUBLIC_BASE!;

// Create S3 client
export const s3Client = new S3Client(s3Config);

// Allowed MIME types for avatar uploads
export const ALLOWED_MIME_TYPES = ["image/jpeg", "image/png", "image/webp"];

// Maximum file size (5MB)
export const MAX_FILE_SIZE = 5 * 1024 * 1024;

// Minimum recommended dimensions
export const MIN_DIMENSIONS = {
  width: 256,
  height: 256,
};

/**
 * Generate a unique object key for provider avatars
 */
export function generateAvatarKey(
  providerId: string,
  filename: string
): string {
  const uuid = uuidv4();
  const extension = filename.split(".").pop()?.toLowerCase() || "jpg";
  return `uploads/providers/${providerId}/${uuid}.${extension}`;
}

/**
 * Generate a unique object key for event images
 */
export function generateEventImageKey(
  eventId: string,
  filename: string
): string {
  const uuid = uuidv4();
  const extension = filename.split(".").pop()?.toLowerCase() || "jpg";
  return `uploads/events/${eventId}/${uuid}.${extension}`;
}

/**
 * Generate a presigned POST URL for direct browser upload
 */
export async function generatePresignedPost(
  key: string,
  contentType: string,
  maxFileSize: number = MAX_FILE_SIZE
) {
  try {
    const presignedPost = await createPresignedPost(s3Client, {
      Bucket: bucketName,
      Key: key,
      Conditions: [
        ["content-length-range", 0, maxFileSize],
        ["starts-with", "$Content-Type", contentType.split("/")[0] + "/"],
      ],
      Fields: {
        "Content-Type": contentType,
      },
      Expires: 300, // 5 minutes
    });

    return presignedPost;
  } catch (error) {
    console.error("Error generating presigned POST:", error);
    throw new Error("Failed to generate upload URL");
  }
}

/**
 * Build public URL for an object key
 */
export function buildPublicUrl(key: string): string {
  return `${publicBaseUrl}/${key}`;
}

/**
 * Validate file upload parameters
 */
export function validateUploadParams(
  filename: string,
  contentType: string,
  fileSize: number
): { valid: boolean; error?: string } {
  // Check MIME type
  if (!ALLOWED_MIME_TYPES.includes(contentType)) {
    return {
      valid: false,
      error: `Invalid file type. Allowed types: ${ALLOWED_MIME_TYPES.join(
        ", "
      )}`,
    };
  }

  // Check file size
  if (fileSize > MAX_FILE_SIZE) {
    return {
      valid: false,
      error: `File too large. Maximum size: ${MAX_FILE_SIZE / (1024 * 1024)}MB`,
    };
  }

  // Check filename
  if (!filename || filename.length > 255) {
    return {
      valid: false,
      error: "Invalid filename",
    };
  }

  return { valid: true };
}

/**
 * Extract file extension from filename
 */
export function getFileExtension(filename: string): string {
  return filename.split(".").pop()?.toLowerCase() || "";
}

/**
 * Validate image dimensions
 */
export function validateImageDimensions(
  width: number,
  height: number
): { valid: boolean; warning?: string } {
  if (width < MIN_DIMENSIONS.width || height < MIN_DIMENSIONS.height) {
    return {
      valid: true,
      warning: `Image is smaller than recommended size (${MIN_DIMENSIONS.width}x${MIN_DIMENSIONS.height}px). Quality may be reduced.`,
    };
  }

  return { valid: true };
}

/**
 * Rate limiting helper - simple in-memory store
 * In production, use Redis or similar
 */
const uploadAttempts = new Map<string, number[]>();

export function checkRateLimit(
  userId: string,
  maxAttempts: number = 10,
  windowMs: number = 60000
): boolean {
  const now = Date.now();
  const userAttempts = uploadAttempts.get(userId) || [];

  // Remove attempts outside the time window
  const recentAttempts = userAttempts.filter(
    (timestamp) => now - timestamp < windowMs
  );

  if (recentAttempts.length >= maxAttempts) {
    return false; // Rate limit exceeded
  }

  // Add current attempt
  recentAttempts.push(now);
  uploadAttempts.set(userId, recentAttempts);

  return true;
}
