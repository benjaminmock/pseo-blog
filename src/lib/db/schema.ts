import {
  sqliteTable,
  integer,
  text,
  numeric,
  real,
  uniqueIndex,
} from "drizzle-orm/sqlite-core";
import { sql } from "drizzle-orm";

export const entries = sqliteTable("entries", {
  id: integer().primaryKey({ autoIncrement: true }),
  name: text(),
  url: text(),
  description: text(),
  citySlug: text("city_slug"),
  categorySlug: text("category_slug"),
});

export const categories = sqliteTable("categories", {
  id: integer().primaryKey({ autoIncrement: true }),
  title: text(),
  slug: text(),
});

export const posts = sqliteTable("posts", {
  id: integer().primaryKey({ autoIncrement: true }),
  title: text(),
  metaDescription: text("meta_description"),
  content: text(),
  citySlug: text("city_slug"),
  categorySlug: text("category_slug"),
});

export const trainers = sqliteTable(
  "Trainers",
  {
    trainerId: integer("trainer_id").primaryKey({ autoIncrement: true }),
    firstName: text("first_name").notNull(),
    lastName: text("last_name").notNull(),
    email: text().notNull(),
    phoneNumber: text("phone_number"),
    bio: text(),
    link: text(),
    slug: text(),
  },
  (table) => [uniqueIndex("Trainers_email_unique").on(table.email)]
);

export const waitlist = sqliteTable("waitlist", {
  id: integer().primaryKey({ autoIncrement: true }),
  name: text().notNull(),
  email: text().notNull(),
  city: text().notNull(),
  createdAt: numeric("created_at").default(sql`(CURRENT_TIMESTAMP)`),
});

export const users = sqliteTable(
  "users",
  {
    id: integer().primaryKey({ autoIncrement: true }),
    email: text().notNull(),
    passwordHash: text("password_hash").notNull(),
    name: text(),
    role: text().default("user"),
    createdAt: numeric("created_at").default(sql`(CURRENT_TIMESTAMP)`),
    updatedAt: numeric("updated_at").default(sql`(CURRENT_TIMESTAMP)`),
  },
  (table) => [uniqueIndex("users_email_unique").on(table.email)]
);

export const nearbyCityDistances = sqliteTable("nearby_city_distances", {
  id: integer().primaryKey().notNull(),
  cityId: integer("city_id"),
  nearbyCityId: integer("nearby_city_id"),
  distance: real(),
});

export const courses = sqliteTable("Courses", {
  courseId: integer("course_id").primaryKey().notNull(),
  courseName: text("course_name").notNull(),
  trainerId: integer("trainer_id").notNull(),
  description: text(),
  startDate: text("start_date").notNull(),
  endDate: text("end_date"),
  citySlug: text("city_slug"),
  slug: text(),
  cityId: integer("city_id"),
  active: integer().default(1),
  capacity: integer(),
  maxCapacity: integer("max_capacity"), // Rename from capacity
  currentEnrollments: integer("current_enrollments").default(0),
  waitlistEnabled: integer("waitlist_enabled").default(1),
  autoConfirmWaitlist: integer("auto_confirm_waitlist").default(1),
  language: text(),
  price: real(),
  duration: integer(),
  location: text(),
  style: text(),
  level: text(),
  // Online/In-Person delivery mode flags
  isOnline: integer("is_online").default(0), // 0 = false, 1 = true (supports online delivery)
  isInPerson: integer("is_in_person").default(1), // 0 = false, 1 = true (supports in-person delivery)
  onlineUrl: text("online_url"), // Meeting link for online courses
  onlinePlatform: text("online_platform"), // "zoom", "teams", "meet", etc.
  onlineInstructions: text("online_instructions"), // Additional instructions for online participants
});

export const sessions = sqliteTable("sessions", {
  id: integer().primaryKey().notNull(),
  userId: integer("user_id").notNull(),
  token: text().notNull(),
  expiresAt: text("expires_at").notNull(),
  createdAt: text("created_at").default(sql`CURRENT_TIMESTAMP`),
});

export const events = sqliteTable("Events", {
  eventId: integer("event_id").primaryKey().notNull(),
  eventName: text("event_name").notNull(),
  trainerId: integer("trainer_id").notNull(),
  description: text(),
  startDate: text("start_date").notNull(),
  endDate: text("end_date"),
  startTime: text("start_time"),
  endTime: text("end_time"),
  citySlug: text("city_slug"),
  slug: text(),
  cityId: integer("city_id"),
  active: integer().default(1),
  maxParticipants: integer("max_participants"),
  currentRegistrations: integer("current_registrations").default(0),
  waitlistEnabled: integer("waitlist_enabled").default(1),
  price: real(),
  // Online/In-Person delivery mode flags
  isOnline: integer("is_online").default(0), // 0 = false, 1 = true (supports online delivery)
  isInPerson: integer("is_in_person").default(1), // 0 = false, 1 = true (supports in-person delivery)
  onlineUrl: text("online_url"), // Meeting link for online events
  onlinePlatform: text("online_platform"), // "zoom", "teams", "meet", etc.
  onlineInstructions: text("online_instructions"), // Additional instructions for online participants
});

export const cities = sqliteTable("cities", {
  id: integer().primaryKey().notNull(),
  city: text(),
  stateCode: text(),
  zip: text(),
  population: integer(),
  longitude: real(),
  latitude: real(),
  state: text(),
  stateSlug: text(),
  slug: text(),
  title: text(),
  metaDescription: text("meta_description"),
  content: text(),
});

export const nearbyCities = sqliteTable("nearby_cities", {
  id: integer().primaryKey().notNull(),
  cityId: integer("city_id"),
  nearbyCityId: integer("nearby_city_id"),
});

export const topics = sqliteTable(
  "topics",
  {
    id: integer().primaryKey().notNull(),
    title: text(),
    metaDescription: text("meta_description"),
    content: text(),
    slug: text(),
  },
  (table) => [uniqueIndex("topics_slug_unique").on(table.slug)]
);

// New Participant Management Tables

export const participants = sqliteTable(
  "participants",
  {
    participantId: integer("participant_id").primaryKey({
      autoIncrement: true,
    }),
    userId: text("user_id"), // Link to Prisma auth user (optional for guest registrations)
    fullName: text("full_name"), // Keep for backward compatibility
    firstName: text("first_name"),
    lastName: text("last_name"),
    email: text().notNull(),
    phone: text("phone_number"),
    isGuest: integer("is_guest").default(0), // 0 = false, 1 = true
    emergencyContact: text("emergency_contact"),
    emergencyPhone: text("emergency_phone"),
    medicalNotes: text("medical_notes"),
    dateOfBirth: text("date_of_birth"),
    address: text(),
    city: text(),
    postalCode: text("postal_code"),
    createdAt: text("created_at").default(sql`CURRENT_TIMESTAMP`),
    updatedAt: text("updated_at").default(sql`CURRENT_TIMESTAMP`),
  },
  (table) => [uniqueIndex("participants_email_unique").on(table.email)]
);

export const courseEnrollments = sqliteTable(
  "course_enrollments",
  {
    enrollmentId: integer("enrollment_id").primaryKey({ autoIncrement: true }),
    participantId: integer("participant_id").notNull(),
    courseId: integer("course_id").notNull(),
    enrollmentDate: text("enrollment_date").default(sql`CURRENT_TIMESTAMP`),
    status: text().default("active"), // active, cancelled, completed, waitlist
    paymentStatus: text("payment_status").default("pending"), // pending, paid, partial, refunded
    totalAmount: real("total_amount"),
    paidAmount: real("paid_amount").default(0),
    notes: text(),
    enrolledBy: integer("enrolled_by"), // trainer_id who enrolled them
  },
  (table) => [
    uniqueIndex("course_enrollments_unique").on(
      table.participantId,
      table.courseId
    ),
  ]
);

export const eventRegistrations = sqliteTable(
  "event_registrations",
  {
    registrationId: integer("registration_id").primaryKey({
      autoIncrement: true,
    }),
    participantId: integer("participant_id").notNull(),
    eventId: integer("event_id").notNull(),
    registrationDate: text("registration_date").default(sql`CURRENT_TIMESTAMP`),
    status: text().default("registered"), // registered, cancelled, attended, no_show
    paymentStatus: text("payment_status").default("pending"),
    totalAmount: real("total_amount"),
    paidAmount: real("paid_amount").default(0),
    notes: text(),
    registeredBy: integer("registered_by"), // trainer_id who registered them
  },
  (table) => [
    uniqueIndex("event_registrations_unique").on(
      table.participantId,
      table.eventId
    ),
  ]
);

export const attendanceRecords = sqliteTable("attendance_records", {
  attendanceId: integer("attendance_id").primaryKey({ autoIncrement: true }),
  participantId: integer("participant_id").notNull(),
  courseId: integer("course_id"),
  eventId: integer("event_id"),
  sessionDate: text("session_date").notNull(),
  sessionNumber: integer("session_number"), // For multi-session courses
  attended: integer("attended").default(0), // 0 = absent, 1 = present, 2 = late
  checkInTime: text("check_in_time"),
  notes: text(),
  recordedAt: text("recorded_at").default(sql`CURRENT_TIMESTAMP`),
  recordedBy: integer("recorded_by"), // trainer_id
});

export const payments = sqliteTable("payments", {
  paymentId: integer("payment_id").primaryKey({ autoIncrement: true }),
  participantId: integer("participant_id").notNull(),
  courseId: integer("course_id"),
  eventId: integer("event_id"),
  enrollmentId: integer("enrollment_id"),
  registrationId: integer("registration_id"),
  amount: real().notNull(),
  currency: text().default("EUR"),
  paymentMethod: text("payment_method"), // cash, transfer, card, paypal, stripe
  status: text().default("pending"), // pending, completed, failed, refunded, cancelled
  transactionId: text("transaction_id"),
  stripePaymentIntentId: text("stripe_payment_intent_id"),
  paidAt: text("paid_at"),
  refundedAt: text("refunded_at"),
  refundAmount: real("refund_amount"),
  createdAt: text("created_at").default(sql`CURRENT_TIMESTAMP`),
  notes: text(),
  processedBy: integer("processed_by"), // trainer_id
});

export const participantWaitlist = sqliteTable("participant_waitlist", {
  waitlistId: integer("waitlist_id").primaryKey({ autoIncrement: true }),
  participantId: integer("participant_id").notNull(),
  courseId: integer("course_id"),
  eventId: integer("event_id"),
  position: integer().notNull(),
  addedAt: text("added_at").default(sql`CURRENT_TIMESTAMP`),
  notifiedAt: text("notified_at"),
  status: text().default("waiting"), // waiting, offered, accepted, declined, expired
  expiresAt: text("expires_at"), // When the offer expires
  notes: text(),
});

// Export types for TypeScript
export type City = typeof cities.$inferSelect;
export type NewCity = typeof cities.$inferInsert;

export type Trainer = typeof trainers.$inferSelect;
export type NewTrainer = typeof trainers.$inferInsert;

export type Course = typeof courses.$inferSelect;
export type NewCourse = typeof courses.$inferInsert;

export type Event = typeof events.$inferSelect;
export type NewEvent = typeof events.$inferInsert;

export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;

export type Post = typeof posts.$inferSelect;
export type NewPost = typeof posts.$inferInsert;

export type Category = typeof categories.$inferSelect;
export type NewCategory = typeof categories.$inferInsert;

export type WaitlistEntry = typeof waitlist.$inferSelect;
export type NewWaitlistEntry = typeof waitlist.$inferInsert;

export type Entry = typeof entries.$inferSelect;
export type NewEntry = typeof entries.$inferInsert;

// New participant management types
export type Participant = typeof participants.$inferSelect;
export type NewParticipant = typeof participants.$inferInsert;

export type CourseEnrollment = typeof courseEnrollments.$inferSelect;
export type NewCourseEnrollment = typeof courseEnrollments.$inferInsert;

export type EventRegistration = typeof eventRegistrations.$inferSelect;
export type NewEventRegistration = typeof eventRegistrations.$inferInsert;

export type AttendanceRecord = typeof attendanceRecords.$inferSelect;
export type NewAttendanceRecord = typeof attendanceRecords.$inferInsert;

export type Payment = typeof payments.$inferSelect;
export type NewPayment = typeof payments.$inferInsert;

export type ParticipantWaitlist = typeof participantWaitlist.$inferSelect;
export type NewParticipantWaitlist = typeof participantWaitlist.$inferInsert;
