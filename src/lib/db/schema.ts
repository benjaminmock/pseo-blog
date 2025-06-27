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
  language: text(),
  price: real(),
  duration: integer(),
  location: text(),
  style: text(),
  level: text(),
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
  price: real(),
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
