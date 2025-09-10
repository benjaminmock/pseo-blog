"use client";

import { useState, useRef, useCallback } from "react";
import Image from "next/image";

interface UploadedImage {
  id: string;
  url: string;
  file?: File;
  isUploading?: boolean;
  isMain?: boolean;
  sortOrder?: number;
}

interface MultiImageUploadProps {
  eventId?: number;
  currentImages?: UploadedImage[];
  onUploadComplete: (images: UploadedImage[]) => void;
  onUploadError: (error: string) => void;
  maxImages?: number;
  autoUpload?: boolean; // New prop to control auto-upload behavior
}

interface UploadState {
  status: "idle" | "validating" | "uploading" | "saving" | "done" | "error";
  progress: number;
  error?: string;
  warning?: string;
}

export default function MultiImageUpload({
  eventId,
  currentImages = [],
  onUploadComplete,
  onUploadError,
  maxImages = 5,
  autoUpload = false,
}: MultiImageUploadProps) {
  const [uploadState, setUploadState] = useState<UploadState>({
    status: "idle",
    progress: 0,
  });
  const [images, setImages] = useState<UploadedImage[]>(currentImages);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
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

  const handleFileSelect = async (files: FileList) => {
    const fileArray = Array.from(files);
    
    // Check if adding these files would exceed the limit
    if (images.length + fileArray.length > maxImages) {
      setUploadState({
        status: "error",
        progress: 0,
        error: `Maximal ${maxImages} Bilder erlaubt. Sie können ${maxImages - images.length} weitere Bilder hinzufügen.`,
      });
      return;
    }

    setUploadState({ status: "validating", progress: 0 });

    // Validate all files
    const validationResults = await Promise.all(
      fileArray.map(file => validateFile(file))
    );

    const invalidFile = validationResults.find(result => !result.valid);
    if (invalidFile) {
      setUploadState({
        status: "error",
        progress: 0,
        error: invalidFile.error,
      });
      return;
    }

    // Create preview images
    const newImages: UploadedImage[] = fileArray.map((file, index) => ({
      id: `temp-${Date.now()}-${index}`,
      url: URL.createObjectURL(file),
      file,
      isUploading: false,
      sortOrder: images.length + index,
    }));

    setSelectedFiles(fileArray);
    const updatedImages = [...images, ...newImages];
    setImages(updatedImages);
    setUploadState({ status: "idle", progress: 0 });
    
    // In autoUpload mode, notify parent of selected images immediately
    if (autoUpload) {
      onUploadComplete(updatedImages);
    }
  };

  const uploadSingleFile = async (file: File, tempId: string): Promise<string> => {
    if (!eventId) {
      throw new Error("Event ID is required for upload");
    }

    // Get image dimensions
    const validation = await validateFile(file);
    const dimensions = validation.dimensions;

    // Step 1: Get presigned URL
    const presignResponse = await fetch("/api/upload/presign", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        filename: file.name,
        contentType: file.type,
        fileSize: file.size,
        scope: "events",
        entityId: eventId.toString(),
      }),
    });

    if (!presignResponse.ok) {
      const error = await presignResponse.json();
      throw new Error(error.error || "Failed to get upload URL");
    }

    const { presignedPost, objectKey } = await presignResponse.json();

    // Step 2: Upload to S3
    const formData = new FormData();
    Object.entries(presignedPost.fields).forEach(([key, value]) => {
      formData.append(key, value as string);
    });
    formData.append("file", file);

    const uploadResponse = await fetch(presignedPost.url, {
      method: "POST",
      body: formData,
    });

    if (!uploadResponse.ok) {
      throw new Error("Upload to storage failed");
    }

    // Step 3: Complete upload
    const completeResponse = await fetch("/api/upload/complete", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        objectKey,
        mimeType: file.type,
        sizeBytes: file.size,
        width: dimensions?.width,
        height: dimensions?.height,
        scope: "events",
        entityId: eventId.toString(),
      }),
    });

    if (!completeResponse.ok) {
      const error = await completeResponse.json();
      throw new Error(error.error || "Failed to save file metadata");
    }

    const result = await completeResponse.json();
    return result.file.id;
  };

  const handleUploadAll = async () => {
    if (selectedFiles.length === 0) return;

    try {
      setUploadState({ status: "uploading", progress: 0 });

      const uploadPromises = selectedFiles.map(async (file, index) => {
        const tempImage = images.find(img => img.file === file);
        if (!tempImage) return null;

        // Mark as uploading
        setImages(prev => prev.map(img => 
          img.id === tempImage.id ? { ...img, isUploading: true } : img
        ));

        try {
          const fileId = await uploadSingleFile(file, tempImage.id);
          
          // Update image with real file ID and remove file reference
          setImages(prev => prev.map(img => 
            img.id === tempImage.id 
              ? { ...img, id: fileId, file: undefined, isUploading: false }
              : img
          ));

          // Update progress
          const progress = ((index + 1) / selectedFiles.length) * 100;
          setUploadState(prev => ({ ...prev, progress }));

          return fileId;
        } catch (error) {
          // Mark as failed
          setImages(prev => prev.map(img => 
            img.id === tempImage.id ? { ...img, isUploading: false } : img
          ));
          throw error;
        }
      });

      await Promise.all(uploadPromises);

      setUploadState({ status: "done", progress: 100 });
      setSelectedFiles([]);
      
      // Clean up temporary URLs
      images.forEach(img => {
        if (img.file && img.url.startsWith('blob:')) {
          URL.revokeObjectURL(img.url);
        }
      });

      onUploadComplete(images.filter(img => !img.file));

      // Reset state after a short delay
      setTimeout(() => {
        setUploadState({ status: "idle", progress: 0 });
      }, 2000);

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

  const handleRemoveImage = async (imageId: string) => {
    const imageToRemove = images.find(img => img.id === imageId);
    if (!imageToRemove) return;

    try {
      // If it's an uploaded image (has eventId), remove from server
      if (eventId && !imageToRemove.file) {
        const response = await fetch(`/api/events/${eventId}/images?fileId=${imageId}`, {
          method: "DELETE",
        });

        if (!response.ok) {
          throw new Error("Failed to remove image from server");
        }
      }

      // Remove from local state
      const updatedImages = images.filter(img => img.id !== imageId);
      setImages(updatedImages);
      
      // Clean up blob URL if it's a temporary image
      if (imageToRemove.url.startsWith('blob:')) {
        URL.revokeObjectURL(imageToRemove.url);
      }

      // Remove from selected files if it's still pending upload
      if (imageToRemove.file) {
        setSelectedFiles(prev => prev.filter(file => file !== imageToRemove.file));
      }
      
      // In autoUpload mode, notify parent of updated images
      if (autoUpload) {
        onUploadComplete(updatedImages);
      }

    } catch (error) {
      onUploadError(error instanceof Error ? error.message : "Failed to remove image");
    }
  };

  const handleSetMainImage = async (imageId: string) => {
    if (!eventId) return;

    try {
      const response = await fetch(`/api/events/${eventId}/images`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fileId: imageId,
          isMain: true,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to set main image");
      }

      // Update local state
      setImages(prev => prev.map(img => ({
        ...img,
        isMain: img.id === imageId
      })));

    } catch (error) {
      onUploadError(error instanceof Error ? error.message : "Failed to set main image");
    }
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      handleFileSelect(files);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const files = e.dataTransfer.files;
    if (files && files.length > 0) {
      handleFileSelect(files);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const getStatusText = () => {
    switch (uploadState.status) {
      case "validating":
        return "Validiere Dateien...";
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
      {/* Current Images Grid */}
      {images.length > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {images.map((image) => (
            <div key={image.id} className="relative group">
              <div className="aspect-square rounded-lg overflow-hidden bg-gray-200">
                <Image
                  src={image.url}
                  alt="Event image"
                  width={200}
                  height={200}
                  className="w-full h-full object-cover"
                />
                {image.isUploading && (
                  <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
                    <div className="text-white text-sm">Uploading...</div>
                  </div>
                )}
              </div>
              
              {/* Image Controls */}
              <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                <button
                  onClick={() => handleRemoveImage(image.id)}
                  className="bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs hover:bg-red-600"
                  disabled={image.isUploading}
                >
                  ×
                </button>
              </div>

              {/* Main Image Badge */}
              {image.isMain && (
                <div className="absolute top-2 left-2 bg-blue-500 text-white text-xs px-2 py-1 rounded">
                  Hauptbild
                </div>
              )}

              {/* Set as Main Button */}
              {!image.isMain && !image.file && (
                <div className="absolute bottom-2 left-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button
                    onClick={() => handleSetMainImage(image.id)}
                    className="bg-blue-500 text-white text-xs px-2 py-1 rounded hover:bg-blue-600"
                  >
                    Als Hauptbild
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Upload Area */}
      {images.length < maxImages && (
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
            multiple
            disabled={uploadState.status === "uploading" || uploadState.status === "saving"}
          />

          <div className="space-y-2">
            <div className="text-gray-600">
              <span className="font-medium">Klicken zum Auswählen</span> oder Dateien hierher ziehen
            </div>
            <div className="text-sm text-gray-500">
              PNG, JPG, WebP bis zu {MAX_SIZE / (1024 * 1024)}MB
            </div>
            <div className="text-xs text-gray-400">
              Maximal {maxImages} Bilder • {images.length}/{maxImages} verwendet
            </div>
          </div>
        </div>
      )}

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

      {/* Action Buttons - only show if not in auto-upload mode */}
      {!autoUpload && selectedFiles.length > 0 && uploadState.status === "idle" && (
        <div className="flex space-x-2">
          <button
            onClick={handleUploadAll}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            {selectedFiles.length} Bild(er) hochladen
          </button>
          <button
            onClick={() => {
              // Remove temporary images and clean up URLs
              const tempImages = images.filter(img => img.file);
              tempImages.forEach(img => {
                if (img.url.startsWith('blob:')) {
                  URL.revokeObjectURL(img.url);
                }
              });
              setImages(prev => prev.filter(img => !img.file));
              setSelectedFiles([]);
              setUploadState({ status: "idle", progress: 0 });
            }}
            className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
          >
            Abbrechen
          </button>
        </div>
      )}
      
      {/* Auto-upload mode message */}
      {autoUpload && selectedFiles.length > 0 && (
        <div className="mt-4 p-3 bg-blue-50 rounded-lg">
          <p className="text-sm text-blue-700">
            {selectedFiles.length} Bild(er) ausgewählt. Diese werden automatisch nach der Event-Erstellung hochgeladen.
          </p>
        </div>
      )}
    </div>
  );
}