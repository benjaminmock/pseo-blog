-- CreateTable
CREATE TABLE "files" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "key" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "mime_type" TEXT NOT NULL,
    "size_bytes" INTEGER NOT NULL,
    "width" INTEGER,
    "height" INTEGER,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL
);

-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Trainers" (
    "trainer_id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "first_name" TEXT NOT NULL,
    "last_name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "phone_number" TEXT,
    "bio" TEXT,
    "link" TEXT,
    "slug" TEXT,
    "avatar_file_id" TEXT,
    CONSTRAINT "Trainers_avatar_file_id_fkey" FOREIGN KEY ("avatar_file_id") REFERENCES "files" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_Trainers" ("bio", "email", "first_name", "last_name", "link", "phone_number", "slug", "trainer_id") SELECT "bio", "email", "first_name", "last_name", "link", "phone_number", "slug", "trainer_id" FROM "Trainers";
DROP TABLE "Trainers";
ALTER TABLE "new_Trainers" RENAME TO "Trainers";
CREATE UNIQUE INDEX "Trainers_email_key" ON "Trainers"("email");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;

-- CreateIndex
CREATE UNIQUE INDEX "files_key_key" ON "files"("key");
