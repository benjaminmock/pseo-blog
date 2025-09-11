"use client";

import { useState } from "react";
import Image from "next/image";
import ImageModal from "./ImageModal";

type EventImage = {
  id: string;
  url: string;
  isMain: boolean;
  sortOrder: number;
};

interface ImageGalleryProps {
  mainImage: EventImage | undefined;
  otherImages: EventImage[];
  eventName: string;
}

export default function ImageGallery({
  mainImage,
  otherImages,
  eventName,
}: ImageGalleryProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);

  // Combine all images for modal navigation (main image first, then others)
  const allImages = mainImage ? [mainImage, ...otherImages] : otherImages;

  const openModal = (imageIndex: number) => {
    setSelectedImageIndex(imageIndex);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
  };

  return (
    <>
      {mainImage ? (
        <div className="relative h-full min-h-[400px]">
          <button
            onClick={() => openModal(0)}
            className="relative w-full h-full block"
          >
            <Image
              src={mainImage.url}
              alt={eventName}
              fill
              className="object-cover hover:scale-105 transition-transform duration-300"
              priority
            />
          </button>
          <div className="absolute inset-0 bg-black bg-opacity-40 flex flex-col items-center justify-center p-8 pointer-events-none">
            <h1 className="text-2xl font-bold text-white text-center mb-4" data-testid="event-title">
              {eventName}
            </h1>
          </div>

          {/* Image Gallery Thumbnails */}
          {otherImages.length > 0 && (
            <div className="absolute bottom-4 left-4 right-4">
              <div className="flex space-x-2 overflow-x-auto">
                {otherImages.slice(0, 4).map((img, index) => (
                  <button
                    key={img.id}
                    onClick={(e) => {
                      e.stopPropagation();
                      openModal(index + 1); // +1 because main image is at index 0
                    }}
                    className="relative w-16 h-16 flex-shrink-0 hover:scale-110 transition-transform duration-200"
                  >
                    <Image
                      src={img.url}
                      alt={`Event image ${index + 2}`}
                      fill
                      className="object-cover rounded border-2 border-white"
                    />
                  </button>
                ))}
                {otherImages.length > 4 && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      openModal(5); // Show 5th image (index 4 in otherImages + 1 for main image)
                    }}
                    className="w-16 h-16 flex-shrink-0 bg-black bg-opacity-60 rounded border-2 border-white flex items-center justify-center hover:bg-opacity-80 transition-all duration-200"
                  >
                    <span className="text-white text-xs font-medium">
                      +{otherImages.length - 4}
                    </span>
                  </button>
                )}
              </div>
            </div>
          )}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center bg-gray-100 p-8 h-full min-h-[400px]">
          <h1 className="text-2xl font-bold text-gray-900 text-center" data-testid="event-title">
            {eventName}
          </h1>
        </div>
      )}

      <ImageModal
        images={allImages}
        initialIndex={selectedImageIndex}
        isOpen={isModalOpen}
        onClose={closeModal}
      />
    </>
  );
}