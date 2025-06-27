CREATE TABLE `categories` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`title` text,
	`slug` text
);
--> statement-breakpoint
CREATE TABLE `cities` (
	`id` integer PRIMARY KEY NOT NULL,
	`city` text,
	`stateCode` text,
	`zip` text,
	`population` integer,
	`longitude` real,
	`latitude` real,
	`state` text,
	`stateSlug` text,
	`slug` text,
	`title` text,
	`meta_description` text,
	`content` text
);
--> statement-breakpoint
CREATE TABLE `Courses` (
	`course_id` integer PRIMARY KEY NOT NULL,
	`course_name` text NOT NULL,
	`trainer_id` integer NOT NULL,
	`description` text,
	`start_date` text NOT NULL,
	`end_date` text,
	`city_slug` text,
	`slug` text,
	`city_id` integer,
	`active` integer DEFAULT 1,
	`capacity` integer,
	`language` text,
	`price` real,
	`duration` integer,
	`location` text,
	`style` text,
	`level` text
);
--> statement-breakpoint
CREATE TABLE `entries` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`name` text,
	`url` text,
	`description` text,
	`city_slug` text,
	`category_slug` text
);
--> statement-breakpoint
CREATE TABLE `Events` (
	`event_id` integer PRIMARY KEY NOT NULL,
	`event_name` text NOT NULL,
	`trainer_id` integer NOT NULL,
	`description` text,
	`start_date` text NOT NULL,
	`end_date` text,
	`start_time` text,
	`end_time` text,
	`city_slug` text,
	`slug` text,
	`city_id` integer,
	`active` integer DEFAULT 1,
	`max_participants` integer,
	`price` real
);
--> statement-breakpoint
CREATE TABLE `nearby_cities` (
	`id` integer PRIMARY KEY NOT NULL,
	`city_id` integer,
	`nearby_city_id` integer
);
--> statement-breakpoint
CREATE TABLE `nearby_city_distances` (
	`id` integer PRIMARY KEY NOT NULL,
	`city_id` integer,
	`nearby_city_id` integer,
	`distance` real
);
--> statement-breakpoint
CREATE TABLE `posts` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`title` text,
	`meta_description` text,
	`content` text,
	`city_slug` text,
	`category_slug` text
);
--> statement-breakpoint
CREATE TABLE `sessions` (
	`id` integer PRIMARY KEY NOT NULL,
	`user_id` integer NOT NULL,
	`token` text NOT NULL,
	`expires_at` text NOT NULL,
	`created_at` text DEFAULT CURRENT_TIMESTAMP
);
--> statement-breakpoint
CREATE TABLE `topics` (
	`id` integer PRIMARY KEY NOT NULL,
	`title` text,
	`meta_description` text,
	`content` text,
	`slug` text
);
--> statement-breakpoint
CREATE UNIQUE INDEX `topics_slug_unique` ON `topics` (`slug`);--> statement-breakpoint
CREATE TABLE `Trainers` (
	`trainer_id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`first_name` text NOT NULL,
	`last_name` text NOT NULL,
	`email` text NOT NULL,
	`phone_number` text,
	`bio` text,
	`link` text,
	`slug` text
);
--> statement-breakpoint
CREATE UNIQUE INDEX `Trainers_email_unique` ON `Trainers` (`email`);--> statement-breakpoint
CREATE TABLE `users` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`email` text NOT NULL,
	`password_hash` text NOT NULL,
	`name` text,
	`role` text DEFAULT 'user',
	`created_at` numeric DEFAULT (CURRENT_TIMESTAMP),
	`updated_at` numeric DEFAULT (CURRENT_TIMESTAMP)
);
--> statement-breakpoint
CREATE UNIQUE INDEX `users_email_unique` ON `users` (`email`);--> statement-breakpoint
CREATE TABLE `waitlist` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`name` text NOT NULL,
	`email` text NOT NULL,
	`city` text NOT NULL,
	`created_at` numeric DEFAULT (CURRENT_TIMESTAMP)
);
