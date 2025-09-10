"use client";

import { useState, useRef, useCallback } from "react";
import Image from "next/image";

interface AvatarUploadProps {
  currentAvatarUrl?: string | null;
  trainerId: number;
  onUploadComplete: (avatarUrl: string) => void;
  onUploadError: (error: string) => void;
}

interface UploadState {
  status: "idle" | "validating" | "uploading" | "saving" | "done" | "error";
  progress: number;
  error?: string;
  warning?: string;
}

export default function AvatarUpload({
  currentAvatarUrl,
  trainerId,
  onUploadComplete,
  onUploadError,
}: AvatarUploadProps) {
  const [uploadState, setUploadState] = useState<UploadState>({
    status: "idle",
    progress: 0,
  });
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp"];
  const MAX_SIZE = 5 * 1024 * 1024; // 5MB
  const MIN_DIMENSIONS = { width: 256, height: 256 };

  const validateFile = useCallback((file: File): Promise<{ valid: boolean; error?: string; warning?: string; dimensions?: { width: number; height: number } }> => {
    return new Promise((resolve) => {
      // Check file type
      if (!ALLOWED_TYPES.includes(file.type)) {
        resolve({
          valid: false,
          error: `Ungültiger Dateityp. Erlaubt: ${ALLOWED_TYPES.join(", ")}`,
        });
        return;
      }

      // Check file size
      if (file.size > MAX_SIZE) {
        resolve({
          valid: false,
          error: `Datei zu groß. Maximum: ${MAX_SIZE / (1024 * 1024)}MB`,
        });
        return;
      }

      // Check image dimensions
      const img = new window.Image();
      img.onload = () => {
        const dimensions = { width: img.width, height: img.height };
        let warning;

        if (img.width < MIN_DIMENSIONS.width || img.height < MIN_DIMENSIONS.height) {
          warning = `Bild ist kleiner als empfohlen (${MIN_DIMENSIONS.width}x${MIN_DIMENSIONS.height}px). Qualität könnte reduziert sein.`;
        }

        resolve({
          valid: true,
          warning,
          dimensions,
        });
      };

      img.onerror = () => {
        resolve({
          valid: false,
          error: "Ungültiges Bildformat",
        });
      };

      img.src = URL.createObjectURL(file);
    });
  }, []);

  const handleFileSelect = async (file: File) => {
    setUploadState({ status: "validating", progress: 0 });
    setSelectedFile(file);

    const validation = await validateFile(file);
    if (!validation.valid) {
      setUploadState({
        status: "error",
        progress: 0,
        error: validation.error,
      });
      return;
    }

    // Create preview
    const preview = URL.createObjectURL(file);
    setPreviewUrl(preview);

    setUploadState({
      status: "idle",
      progress: 0,
      warning: validation.warning,
    });
  };

  const handleUpload = async () => {
    if (!selectedFile) return;

    try {
      setUploadState({ status: "uploading", progress: 0 });

      // Get image dimensions
      const validation = await validateFile(selectedFile);
      const dimensions = validation.dimensions;

      // Step 1: Get presigned URL
      const presignResponse = await fetch("/api/upload/presign", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          filename: selectedFile.name,
          contentType: selectedFile.type,
          fileSize: selectedFile.size,
          scope: "providers",
          entityId: trainerId.toString(),
        }),
      });

      if (!presignResponse.ok) {
        const error = await presignResponse.json();
        throw new Error(error.error || "Failed to get upload URL");
      }

      const { presignedPost, objectKey } = await presignResponse.json();
      setUploadState({ status: "uploading", progress: 25 });

      // Step 2: Upload to S3
      const formData = new FormData();
      Object.entries(presignedPost.fields).forEach(([key, value]) => {
        formData.append(key, value as string);
      });
      formData.append("file", selectedFile);

      const uploadResponse = await fetch(presignedPost.url, {
        method: "POST",
        body: formData,
      });

      if (!uploadResponse.ok) {
        throw new Error("Upload to storage failed");
      }

      setUploadState({ status: "saving", progress: 75 });

      // Step 3: Complete upload
      const completeResponse = await fetch("/api/upload/complete", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          objectKey,
          mimeType: selectedFile.type,
          sizeBytes: selectedFile.size,
          width: dimensions?.width,
          height: dimensions?.height,
          scope: "providers",
          entityId: trainerId.toString(),
        }),
      });

      if (!completeResponse.ok) {
        const error = await completeResponse.json();
        throw new Error(error.error || "Failed to save file metadata");
      }

      const result = await completeResponse.json();
      setUploadState({ status: "done", progress: 100 });

      // Clean up preview
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
      }

      onUploadComplete(result.publicUrl);
      
      // Reset state
      setSelectedFile(null);
      setPreviewUrl(null);
      setUploadState({ status: "idle", progress: 0 });

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Upload failed";
      setUploadState({
        status: "error",
        progress: 0,
        error: errorMessage,
      });
      onUploadError(errorMessage);
    }
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleFileSelect(file);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file) {
      handleFileSelect(file);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const resetUpload = () => {
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
    }
    setSelectedFile(null);
    setPreviewUrl(null);
    setUploadState({ status: "idle", progress: 0 });
  };

  const getStatusText = () => {
    switch (uploadState.status) {
      case "validating":
        return "Validiere Datei...";
      case "uploading":
        return "Lade hoch...";
      case "saving":
        return "Speichere...";
      case "done":
        return "Erfolgreich hochgeladen!";
      case "error":
        return "Fehler beim Upload";
      default:
        return "";
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center space-x-4">
        {/* Current Avatar */}
        <div className="w-20 h-20 rounded-full overflow-hidden bg-gray-200 flex items-center justify-center">
          {currentAvatarUrl ? (
            <Image
              src={currentAvatarUrl}
              alt="Current avatar"
              width={80}
              height={80}
              className="w-full h-full object-cover"
            />
          ) : (
            <span className="text-gray-400 text-2xl">👤</span>
          )}
        </div>

        {/* Preview */}
        {previewUrl && (
          <div className="w-20 h-20 rounded-full overflow-hidden bg-gray-200 flex items-center justify-center border-2 border-blue-500">
            <Image
              src={previewUrl}
              alt="Preview"
              width={80}
              height={80}
              className="w-full h-full object-cover"
            />
          </div>
        )}
      </div>

      {/* Upload Area */}
      <div
        className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-gray-400 transition-colors cursor-pointer"
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onClick={() => fileInputRef.current?.click()}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept={ALLOWED_TYPES.join(",")}
          onChange={handleFileInputChange}
          className="hidden"
          disabled={uploadState.status === "uploading" || uploadState.status === "saving"}
        />

        <div className="space-y-2">
          <div className="text-gray-600">
            <span className="font-medium">Klicken zum Auswählen</span> oder Datei hierher ziehen
          </div>
          <div className="text-sm text-gray-500">
            PNG, JPG, WebP bis zu {MAX_SIZE / (1024 * 1024)}MB
          </div>
          <div className="text-xs text-gray-400">
            Empfohlen: mindestens {MIN_DIMENSIONS.width}x{MIN_DIMENSIONS.height}px, quadratisch
          </div>
        </div>
      </div>

      {/* Status Messages */}
      {uploadState.warning && (
        <div className="bg-yellow-50 text-yellow-700 p-3 rounded-lg text-sm">
          {uploadState.warning}
        </div>
      )}

      {uploadState.error && (
        <div className="bg-red-50 text-red-700 p-3 rounded-lg text-sm">
          {uploadState.error}
        </div>
      )}

      {uploadState.status !== "idle" && uploadState.status !== "error" && (
        <div className="space-y-2">
          <div className="text-sm text-gray-600">{getStatusText()}</div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className="bg-blue-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${uploadState.progress}%` }}
            />
          </div>
        </div>
      )}

      {/* Action Buttons */}
      {selectedFile && uploadState.status === "idle" && (
        <div className="flex space-x-2">
          <button
            onClick={handleUpload}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Avatar hochladen
          </button>
          <button
            onClick={resetUpload}
            className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
          >
            Abbrechen
          </button>
        </div>
      )}
    </div>
  );
}