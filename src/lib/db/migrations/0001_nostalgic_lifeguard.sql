CREATE TABLE `attendance_records` (
	`attendance_id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`participant_id` integer NOT NULL,
	`course_id` integer,
	`event_id` integer,
	`session_date` text NOT NULL,
	`session_number` integer,
	`attended` integer DEFAULT 0,
	`check_in_time` text,
	`notes` text,
	`recorded_at` text DEFAULT CURRENT_TIMESTAMP,
	`recorded_by` integer
);
--> statement-breakpoint
CREATE TABLE `course_enrollments` (
	`enrollment_id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`participant_id` integer NOT NULL,
	`course_id` integer NOT NULL,
	`enrollment_date` text DEFAULT CURRENT_TIMESTAMP,
	`status` text DEFAULT 'active',
	`payment_status` text DEFAULT 'pending',
	`total_amount` real,
	`paid_amount` real DEFAULT 0,
	`notes` text,
	`enrolled_by` integer
);
--> statement-breakpoint
CREATE UNIQUE INDEX `course_enrollments_unique` ON `course_enrollments` (`participant_id`,`course_id`);--> statement-breakpoint
CREATE TABLE `event_registrations` (
	`registration_id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`participant_id` integer NOT NULL,
	`event_id` integer NOT NULL,
	`registration_date` text DEFAULT CURRENT_TIMESTAMP,
	`status` text DEFAULT 'registered',
	`payment_status` text DEFAULT 'pending',
	`total_amount` real,
	`paid_amount` real DEFAULT 0,
	`notes` text,
	`registered_by` integer
);
--> statement-breakpoint
CREATE UNIQUE INDEX `event_registrations_unique` ON `event_registrations` (`participant_id`,`event_id`);--> statement-breakpoint
CREATE TABLE `participant_waitlist` (
	`waitlist_id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`participant_id` integer NOT NULL,
	`course_id` integer,
	`event_id` integer,
	`position` integer NOT NULL,
	`added_at` text DEFAULT CURRENT_TIMESTAMP,
	`notified_at` text,
	`status` text DEFAULT 'waiting',
	`expires_at` text,
	`notes` text
);
--> statement-breakpoint
CREATE TABLE `participants` (
	`participant_id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`user_id` text,
	`full_name` text NOT NULL,
	`email` text NOT NULL,
	`phone_number` text,
	`emergency_contact` text,
	`emergency_phone` text,
	`medical_notes` text,
	`date_of_birth` text,
	`address` text,
	`city` text,
	`postal_code` text,
	`created_at` text DEFAULT CURRENT_TIMESTAMP,
	`updated_at` text DEFAULT CURRENT_TIMESTAMP
);
--> statement-breakpoint
CREATE UNIQUE INDEX `participants_email_unique` ON `participants` (`email`);--> statement-breakpoint
CREATE TABLE `payments` (
	`payment_id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`participant_id` integer NOT NULL,
	`course_id` integer,
	`event_id` integer,
	`enrollment_id` integer,
	`registration_id` integer,
	`amount` real NOT NULL,
	`currency` text DEFAULT 'EUR',
	`payment_method` text,
	`status` text DEFAULT 'pending',
	`transaction_id` text,
	`stripe_payment_intent_id` text,
	`paid_at` text,
	`refunded_at` text,
	`refund_amount` real,
	`created_at` text DEFAULT CURRENT_TIMESTAMP,
	`notes` text,
	`processed_by` integer
);
--> statement-breakpoint
ALTER TABLE `Courses` ADD `max_capacity` integer;--> statement-breakpoint
ALTER TABLE `Courses` ADD `current_enrollments` integer DEFAULT 0;--> statement-breakpoint
ALTER TABLE `Courses` ADD `waitlist_enabled` integer DEFAULT 1;--> statement-breakpoint
ALTER TABLE `Courses` ADD `auto_confirm_waitlist` integer DEFAULT 1;--> statement-breakpoint
ALTER TABLE `Events` ADD `current_registrations` integer DEFAULT 0;--> statement-breakpoint
ALTER TABLE `Events` ADD `waitlist_enabled` integer DEFAULT 1;