PRAGMA foreign_keys=OFF;--> statement-breakpoint
CREATE TABLE `__new_participants` (
	`participant_id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`user_id` text,
	`full_name` text,
	`first_name` text,
	`last_name` text,
	`email` text NOT NULL,
	`phone_number` text,
	`is_guest` integer DEFAULT 0,
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
INSERT INTO `__new_participants`("participant_id", "user_id", "full_name", "first_name", "last_name", "email", "phone_number", "is_guest", "emergency_contact", "emergency_phone", "medical_notes", "date_of_birth", "address", "city", "postal_code", "created_at", "updated_at") SELECT "participant_id", "user_id", "full_name", "first_name", "last_name", "email", "phone_number", "is_guest", "emergency_contact", "emergency_phone", "medical_notes", "date_of_birth", "address", "city", "postal_code", "created_at", "updated_at" FROM `participants`;--> statement-breakpoint
DROP TABLE `participants`;--> statement-breakpoint
ALTER TABLE `__new_participants` RENAME TO `participants`;--> statement-breakpoint
PRAGMA foreign_keys=ON;--> statement-breakpoint
CREATE UNIQUE INDEX `participants_email_unique` ON `participants` (`email`);