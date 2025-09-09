-- CreateTable
CREATE TABLE "entries" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "name" TEXT,
    "url" TEXT,
    "description" TEXT,
    "city_slug" TEXT,
    "category_slug" TEXT
);

-- CreateTable
CREATE TABLE "categories" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "title" TEXT,
    "slug" TEXT
);

-- CreateTable
CREATE TABLE "posts" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "title" TEXT,
    "meta_description" TEXT,
    "content" TEXT,
    "city_slug" TEXT,
    "category_slug" TEXT
);

-- CreateTable
CREATE TABLE "Trainers" (
    "trainer_id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "first_name" TEXT NOT NULL,
    "last_name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "phone_number" TEXT,
    "bio" TEXT,
    "link" TEXT,
    "slug" TEXT
);

-- CreateTable
CREATE TABLE "waitlist" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "city" TEXT NOT NULL,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateTable
CREATE TABLE "nearby_city_distances" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "city_id" INTEGER,
    "nearby_city_id" INTEGER,
    "distance" REAL
);

-- CreateTable
CREATE TABLE "Courses" (
    "course_id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "course_name" TEXT NOT NULL,
    "trainer_id" INTEGER NOT NULL,
    "description" TEXT,
    "start_date" TEXT NOT NULL,
    "end_date" TEXT,
    "city_slug" TEXT,
    "slug" TEXT,
    "city_id" INTEGER,
    "active" INTEGER NOT NULL DEFAULT 1,
    "capacity" INTEGER,
    "max_capacity" INTEGER,
    "current_enrollments" INTEGER NOT NULL DEFAULT 0,
    "waitlist_enabled" INTEGER NOT NULL DEFAULT 1,
    "auto_confirm_waitlist" INTEGER NOT NULL DEFAULT 1,
    "language" TEXT,
    "price" REAL,
    "duration" INTEGER,
    "location" TEXT,
    "style" TEXT,
    "level" TEXT,
    "is_online" INTEGER NOT NULL DEFAULT 0,
    "is_in_person" INTEGER NOT NULL DEFAULT 1,
    "online_url" TEXT,
    "online_platform" TEXT,
    "online_instructions" TEXT,
    CONSTRAINT "Courses_city_id_fkey" FOREIGN KEY ("city_id") REFERENCES "cities" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "Courses_trainer_id_fkey" FOREIGN KEY ("trainer_id") REFERENCES "Trainers" ("trainer_id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Events" (
    "event_id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "event_name" TEXT NOT NULL,
    "trainer_id" INTEGER NOT NULL,
    "description" TEXT,
    "start_date" TEXT NOT NULL,
    "end_date" TEXT,
    "start_time" TEXT,
    "end_time" TEXT,
    "city_slug" TEXT,
    "slug" TEXT,
    "city_id" INTEGER,
    "active" INTEGER NOT NULL DEFAULT 1,
    "max_participants" INTEGER,
    "current_registrations" INTEGER NOT NULL DEFAULT 0,
    "waitlist_enabled" INTEGER NOT NULL DEFAULT 1,
    "price" REAL,
    "is_online" INTEGER NOT NULL DEFAULT 0,
    "is_in_person" INTEGER NOT NULL DEFAULT 1,
    "online_url" TEXT,
    "online_platform" TEXT,
    "online_instructions" TEXT,
    CONSTRAINT "Events_city_id_fkey" FOREIGN KEY ("city_id") REFERENCES "cities" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "Events_trainer_id_fkey" FOREIGN KEY ("trainer_id") REFERENCES "Trainers" ("trainer_id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "cities" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "city" TEXT,
    "stateCode" TEXT,
    "zip" TEXT,
    "population" INTEGER,
    "longitude" REAL,
    "latitude" REAL,
    "state" TEXT,
    "stateSlug" TEXT,
    "slug" TEXT,
    "title" TEXT,
    "meta_description" TEXT,
    "content" TEXT
);

-- CreateTable
CREATE TABLE "nearby_cities" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "city_id" INTEGER,
    "nearby_city_id" INTEGER,
    CONSTRAINT "nearby_cities_nearby_city_id_fkey" FOREIGN KEY ("nearby_city_id") REFERENCES "cities" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "nearby_cities_city_id_fkey" FOREIGN KEY ("city_id") REFERENCES "cities" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "topics" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "title" TEXT,
    "meta_description" TEXT,
    "content" TEXT,
    "slug" TEXT
);

-- CreateTable
CREATE TABLE "participants" (
    "participant_id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "user_id" TEXT,
    "full_name" TEXT,
    "first_name" TEXT,
    "last_name" TEXT,
    "email" TEXT NOT NULL,
    "phone_number" TEXT,
    "is_guest" INTEGER NOT NULL DEFAULT 0,
    "emergency_contact" TEXT,
    "emergency_phone" TEXT,
    "medical_notes" TEXT,
    "date_of_birth" TEXT,
    "address" TEXT,
    "city" TEXT,
    "postal_code" TEXT,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "participants_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "User" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "course_enrollments" (
    "enrollment_id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "participant_id" INTEGER NOT NULL,
    "course_id" INTEGER NOT NULL,
    "enrollment_date" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "status" TEXT NOT NULL DEFAULT 'active',
    "payment_status" TEXT NOT NULL DEFAULT 'pending',
    "total_amount" REAL,
    "paid_amount" REAL NOT NULL DEFAULT 0,
    "notes" TEXT,
    "enrolled_by" INTEGER,
    CONSTRAINT "course_enrollments_enrolled_by_fkey" FOREIGN KEY ("enrolled_by") REFERENCES "Trainers" ("trainer_id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "course_enrollments_course_id_fkey" FOREIGN KEY ("course_id") REFERENCES "Courses" ("course_id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "course_enrollments_participant_id_fkey" FOREIGN KEY ("participant_id") REFERENCES "participants" ("participant_id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "event_registrations" (
    "registration_id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "participant_id" INTEGER NOT NULL,
    "event_id" INTEGER NOT NULL,
    "registration_date" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "status" TEXT NOT NULL DEFAULT 'registered',
    "payment_status" TEXT NOT NULL DEFAULT 'pending',
    "total_amount" REAL,
    "paid_amount" REAL NOT NULL DEFAULT 0,
    "notes" TEXT,
    "registered_by" INTEGER,
    CONSTRAINT "event_registrations_registered_by_fkey" FOREIGN KEY ("registered_by") REFERENCES "Trainers" ("trainer_id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "event_registrations_event_id_fkey" FOREIGN KEY ("event_id") REFERENCES "Events" ("event_id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "event_registrations_participant_id_fkey" FOREIGN KEY ("participant_id") REFERENCES "participants" ("participant_id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "attendance_records" (
    "attendance_id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "participant_id" INTEGER NOT NULL,
    "course_id" INTEGER,
    "event_id" INTEGER,
    "session_date" TEXT NOT NULL,
    "session_number" INTEGER,
    "attended" INTEGER NOT NULL DEFAULT 0,
    "check_in_time" TEXT,
    "notes" TEXT,
    "recorded_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "recorded_by" INTEGER,
    CONSTRAINT "attendance_records_recorded_by_fkey" FOREIGN KEY ("recorded_by") REFERENCES "Trainers" ("trainer_id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "attendance_records_event_id_fkey" FOREIGN KEY ("event_id") REFERENCES "Events" ("event_id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "attendance_records_course_id_fkey" FOREIGN KEY ("course_id") REFERENCES "Courses" ("course_id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "attendance_records_participant_id_fkey" FOREIGN KEY ("participant_id") REFERENCES "participants" ("participant_id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "payments" (
    "payment_id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "participant_id" INTEGER NOT NULL,
    "course_id" INTEGER,
    "event_id" INTEGER,
    "enrollment_id" INTEGER,
    "registration_id" INTEGER,
    "amount" REAL NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'EUR',
    "payment_method" TEXT,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "transaction_id" TEXT,
    "stripe_payment_intent_id" TEXT,
    "paid_at" TEXT,
    "refunded_at" TEXT,
    "refund_amount" REAL,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "notes" TEXT,
    "processed_by" INTEGER,
    CONSTRAINT "payments_processed_by_fkey" FOREIGN KEY ("processed_by") REFERENCES "Trainers" ("trainer_id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "payments_registration_id_fkey" FOREIGN KEY ("registration_id") REFERENCES "event_registrations" ("registration_id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "payments_enrollment_id_fkey" FOREIGN KEY ("enrollment_id") REFERENCES "course_enrollments" ("enrollment_id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "payments_event_id_fkey" FOREIGN KEY ("event_id") REFERENCES "Events" ("event_id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "payments_course_id_fkey" FOREIGN KEY ("course_id") REFERENCES "Courses" ("course_id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "payments_participant_id_fkey" FOREIGN KEY ("participant_id") REFERENCES "participants" ("participant_id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "participant_waitlist" (
    "waitlist_id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "participant_id" INTEGER NOT NULL,
    "course_id" INTEGER,
    "event_id" INTEGER,
    "position" INTEGER NOT NULL,
    "added_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "notified_at" TEXT,
    "status" TEXT NOT NULL DEFAULT 'waiting',
    "expires_at" TEXT,
    "notes" TEXT,
    CONSTRAINT "participant_waitlist_event_id_fkey" FOREIGN KEY ("event_id") REFERENCES "Events" ("event_id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "participant_waitlist_course_id_fkey" FOREIGN KEY ("course_id") REFERENCES "Courses" ("course_id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "participant_waitlist_participant_id_fkey" FOREIGN KEY ("participant_id") REFERENCES "participants" ("participant_id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "Trainers_email_key" ON "Trainers"("email");

-- CreateIndex
CREATE UNIQUE INDEX "topics_slug_key" ON "topics"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "participants_email_key" ON "participants"("email");

-- CreateIndex
CREATE UNIQUE INDEX "course_enrollments_participant_id_course_id_key" ON "course_enrollments"("participant_id", "course_id");

-- CreateIndex
CREATE UNIQUE INDEX "event_registrations_participant_id_event_id_key" ON "event_registrations"("participant_id", "event_id");
