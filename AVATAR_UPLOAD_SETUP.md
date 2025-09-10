# Provider Avatar Upload Setup Guide

This guide explains how to set up and use the provider profile picture upload functionality in the yoga platform.

## Overview

The avatar upload system allows teachers/providers to upload and manage their profile pictures using:
- **Storage**: S3-compatible storage (MinIO locally, R2/S3 in production)
- **Upload Flow**: Presigned POST URLs for direct browser-to-storage uploads
- **Security**: Server-side validation and authorization
- **UI**: Integrated drag-and-drop upload with preview

## Local Development Setup

### 1. Start MinIO

First, start the MinIO service using Docker Compose:

```bash
docker-compose up -d minio
```

This will start MinIO on:
- **S3 API**: http://localhost:9000
- **Admin Console**: http://localhost:9001

### 2. Configure MinIO

Run the setup script to configure CORS and create the bucket:

```bash
./scripts/setup-minio.sh
```

This script will:
- Install MinIO client (mc) if needed
- Create the `yoga-platform` bucket
- Configure CORS for localhost:3000
- Set public read access for uploaded files

### 3. Environment Variables

Ensure your `.env.local` file contains the MinIO configuration:

```env
# MinIO / S3 Configuration
S3_REGION="us-east-1"
S3_ENDPOINT="http://localhost:9000"
S3_ACCESS_KEY_ID="minioadmin"
S3_SECRET_ACCESS_KEY="minioadmin"
S3_BUCKET_NAME="yoga-platform"
S3_FORCE_PATH_STYLE="true"
S3_PUBLIC_BASE_URL="http://localhost:9000/yoga-platform"
```

### 4. Database Migration

The database schema has been updated to include file storage. Ensure migrations are applied:

```bash
npx prisma migrate dev
```

## Usage

### For Teachers/Providers

1. **Access Profile**: Navigate to `/profil` when logged in as a teacher
2. **Edit Profile**: Click "Profil bearbeiten" 
3. **Upload Avatar**: 
   - Drag and drop an image or click to select
   - Supported formats: JPEG, PNG, WebP
   - Maximum size: 5MB
   - Recommended: 256x256px or larger, square aspect ratio
4. **Preview**: See live preview before uploading
5. **Upload**: Click "Avatar hochladen" to save

### Avatar Display

Avatars are displayed in:
- Profile edit form (`/profil`)
- Public trainer profile pages (`/trainer/[slug]`)
- Teacher dashboard
- Any other trainer listings

## Technical Implementation

### Database Schema

```sql
-- File model for storing upload metadata
CREATE TABLE files (
  id TEXT PRIMARY KEY,
  key TEXT UNIQUE NOT NULL,
  url TEXT NOT NULL,
  mime_type TEXT NOT NULL,
  size_bytes INTEGER NOT NULL,
  width INTEGER,
  height INTEGER,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Trainer model updated with avatar relation
ALTER TABLE Trainers ADD COLUMN avatar_file_id TEXT REFERENCES files(id);
```

### API Endpoints

#### POST `/api/upload/presign`
Generates presigned POST URL for direct upload to storage.

**Request:**
```json
{
  "filename": "avatar.jpg",
  "contentType": "image/jpeg",
  "fileSize": 1024000,
  "scope": "providers",
  "entityId": "123"
}
```

**Response:**
```json
{
  "presignedPost": {
    "url": "http://localhost:9000/yoga-platform",
    "fields": { ... }
  },
  "objectKey": "uploads/providers/123/uuid.jpg",
  "maxFileSize": 5242880,
  "allowedMimeTypes": ["image/jpeg", "image/png", "image/webp"]
}
```

#### POST `/api/upload/complete`
Completes upload by storing metadata and linking to provider.

**Request:**
```json
{
  "objectKey": "uploads/providers/123/uuid.jpg",
  "mimeType": "image/jpeg",
  "sizeBytes": 1024000,
  "width": 512,
  "height": 512,
  "scope": "providers",
  "entityId": "123"
}
```

### Upload Flow

1. **Client validates** file type, size, dimensions
2. **Request presigned URL** from `/api/upload/presign`
3. **Upload directly** to MinIO using presigned POST
4. **Complete upload** by calling `/api/upload/complete`
5. **Update UI** with new avatar URL

### Security Features

- **Authorization**: Only owners and admins can upload for a provider
- **Validation**: Server-side MIME type and size validation
- **Rate Limiting**: 10 uploads per minute per user
- **Unique Keys**: UUID-based object keys prevent conflicts
- **CORS**: Configured for localhost:3000 only

### File Organization

```
yoga-platform/
└── uploads/
    └── providers/
        └── {providerId}/
            ├── {uuid1}.jpg
            ├── {uuid2}.png
            └── {uuid3}.webp
```

## Production Deployment

### Environment Variables

For production, update environment variables to use your S3-compatible service:

```env
# Production S3 Configuration
S3_REGION="auto"  # or your region
S3_ENDPOINT="https://your-s3-endpoint.com"
S3_ACCESS_KEY_ID="your-access-key"
S3_SECRET_ACCESS_KEY="your-secret-key"
S3_BUCKET_NAME="your-bucket-name"
S3_FORCE_PATH_STYLE="false"  # usually false for production
S3_PUBLIC_BASE_URL="https://your-cdn-domain.com/your-bucket-name"
```

### CORS Configuration

Ensure your production storage service has CORS configured for your domain:

```json
{
  "CORSRules": [
    {
      "AllowedOrigins": ["https://yourdomain.com"],
      "AllowedMethods": ["GET", "POST", "PUT"],
      "AllowedHeaders": ["*"],
      "ExposeHeaders": ["ETag"]
    }
  ]
}
```

## Troubleshooting

### Common Issues

1. **CORS Errors**: Ensure MinIO CORS is configured correctly
2. **Upload Fails**: Check MinIO is running and accessible
3. **File Not Found**: Verify bucket exists and has correct permissions
4. **Large Files**: Check file size limits in both client and server validation

### Debug Commands

```bash
# Check MinIO status
docker-compose ps minio

# View MinIO logs
docker-compose logs minio

# Test MinIO connectivity
curl http://localhost:9000/minio/health/live

# List buckets
mc ls local/

# Check bucket policy
mc policy get local/yoga-platform
```

### Reset MinIO

To completely reset MinIO data:

```bash
docker-compose down
rm -rf ./data/minio
docker-compose up -d minio
./scripts/setup-minio.sh
```

## Testing

### Manual Testing

1. Start the application and MinIO
2. Log in as a teacher
3. Navigate to profile page
4. Test upload with various file types and sizes
5. Verify avatar displays correctly

### Automated Testing

Run the test suite:

```bash
# Unit tests
npm test

# Integration tests
npm run test:integration

# E2E tests
npm run test:e2e
```

## Monitoring

### Metrics to Monitor

- Upload success/failure rates
- Average upload times
- Storage usage
- Rate limit violations
- CORS errors

### Logging

The system logs:
- Presign requests (user, provider, file info)
- Upload completions (key, size, duration)
- Authorization failures
- Validation errors

Check application logs for upload-related events:

```bash
# Development
npm run dev

# Production
pm2 logs your-app-name