CREATE TABLE `airports` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`icao` text,
	`name` text,
	`elevation` integer,
	`lat` real,
	`lon` real
);
--> statement-breakpoint
CREATE UNIQUE INDEX `airports_icao_unique` ON `airports` (`icao`);--> statement-breakpoint
CREATE TABLE `runways` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`widthMetres` real,
	`lat` real,
	`lon` real,
	`number` text,
	`airportIcao` text,
	FOREIGN KEY (`airportIcao`) REFERENCES `airports`(`icao`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `waypoints` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`ident` text,
	`lat` real,
	`lon` real,
	`airport` text,
	`region` text
);
