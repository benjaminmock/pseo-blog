-- CreateTable
CREATE TABLE "event_images" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "event_id" INTEGER NOT NULL,
    "file_id" TEXT NOT NULL,
    "sort_order" INTEGER NOT NULL DEFAULT 0,
    "is_main" BOOLEAN NOT NULL DEFAULT false,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "event_images_event_id_fkey" FOREIGN KEY ("event_id") REFERENCES "Events" ("event_id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "event_images_file_id_fkey" FOREIGN KEY ("file_id") REFERENCES "files" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "event_images_event_id_file_id_key" ON "event_images"("event_id", "file_id");
