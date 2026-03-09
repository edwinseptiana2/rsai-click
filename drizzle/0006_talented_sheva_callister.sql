CREATE TABLE `short_link_clicks` (
	`id` int AUTO_INCREMENT NOT NULL,
	`short_link_id` int NOT NULL,
	`ip_address` varchar(45),
	`user_agent` text,
	`referer` text,
	`clicked_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `short_link_clicks_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `short_links` (
	`id` int AUTO_INCREMENT NOT NULL,
	`user_id` varchar(36) NOT NULL,
	`slug` varchar(20) NOT NULL,
	`target_url` text NOT NULL,
	`title` varchar(255),
	`description` text,
	`is_active` boolean NOT NULL DEFAULT true,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	`updated_at` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `short_links_id` PRIMARY KEY(`id`),
	CONSTRAINT `short_slug_idx` UNIQUE(`slug`)
);
--> statement-breakpoint
ALTER TABLE `short_link_clicks` ADD CONSTRAINT `short_link_clicks_short_link_id_short_links_id_fk` FOREIGN KEY (`short_link_id`) REFERENCES `short_links`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `short_links` ADD CONSTRAINT `short_links_user_id_user_id_fk` FOREIGN KEY (`user_id`) REFERENCES `user`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX `short_link_id_idx` ON `short_link_clicks` (`short_link_id`);--> statement-breakpoint
CREATE INDEX `short_user_id_idx` ON `short_links` (`user_id`);