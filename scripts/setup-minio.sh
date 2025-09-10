#!/bin/bash

# Setup script for MinIO with CORS configuration
# This script configures MinIO for local development with proper CORS settings

echo "Setting up MinIO for local development..."

# Wait for MinIO to be ready
echo "Waiting for MinIO to start..."
sleep 5

# Install MinIO client if not present
if ! command -v mc &> /dev/null; then
    echo "Installing MinIO client..."
    curl https://dl.min.io/client/mc/release/linux-amd64/mc \
      --create-dirs \
      -o $HOME/minio-binaries/mc
    chmod +x $HOME/minio-binaries/mc
    export PATH=$PATH:$HOME/minio-binaries/
fi

# Configure MinIO client
echo "Configuring MinIO client..."
mc alias set local http://localhost:9000 minioadmin minioadmin

# Create bucket if it doesn't exist
echo "Creating bucket 'yoga-platform'..."
mc mb local/yoga-platform --ignore-existing

# Set bucket policy to allow public read access for uploaded files
echo "Setting bucket policy..."
cat > /tmp/bucket-policy.json << EOF
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Principal": {
        "AWS": ["*"]
      },
      "Action": ["s3:GetObject"],
      "Resource": ["arn:aws:s3:::yoga-platform/uploads/*"]
    }
  ]
}
EOF

mc policy set-json /tmp/bucket-policy.json local/yoga-platform

# Configure CORS for the bucket
echo "Setting CORS configuration..."
cat > /tmp/cors-config.json << EOF
{
  "CORSRules": [
    {
      "AllowedOrigins": ["http://localhost:3000", "http://127.0.0.1:3000"],
      "AllowedMethods": ["GET", "POST", "PUT", "DELETE"],
      "AllowedHeaders": ["*"],
      "ExposeHeaders": ["ETag", "x-amz-request-id"]
    }
  ]
}
EOF

mc cors set /tmp/cors-config.json local/yoga-platform

# Clean up temporary files
rm /tmp/bucket-policy.json /tmp/cors-config.json

echo "MinIO setup complete!"
echo "- Bucket 'yoga-platform' created"
echo "- CORS configured for localhost:3000"
echo "- Public read access enabled for uploads/* path"
echo ""
echo "MinIO Console: http://localhost:9001"
echo "Username: minioadmin"
echo "Password: minioadmin"