ALTER TABLE `Courses` ADD `is_online` integer DEFAULT 0;--> statement-breakpoint
ALTER TABLE `Courses` ADD `is_in_person` integer DEFAULT 1;--> statement-breakpoint
ALTER TABLE `Courses` ADD `online_url` text;--> statement-breakpoint
ALTER TABLE `Courses` ADD `online_platform` text;--> statement-breakpoint
ALTER TABLE `Courses` ADD `online_instructions` text;--> statement-breakpoint
ALTER TABLE `Events` ADD `is_online` integer DEFAULT 0;--> statement-breakpoint
ALTER TABLE `Events` ADD `is_in_person` integer DEFAULT 1;--> statement-breakpoint
ALTER TABLE `Events` ADD `online_url` text;--> statement-breakpoint
ALTER TABLE `Events` ADD `online_platform` text;--> statement-breakpoint
ALTER TABLE `Events` ADD `online_instructions` text;