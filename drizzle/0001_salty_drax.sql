CREATE TABLE `gates` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`name` text,
	`airportIcao` text,
	`lat` real,
	`lon` real,
	FOREIGN KEY (`airportIcao`) REFERENCES `airports`(`icao`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE INDEX `gate_airport_icao_idx` ON `gates` (`airportIcao`);--> statement-breakpoint
CREATE INDEX `icao_idx` ON `airports` (`icao`);--> statement-breakpoint
CREATE INDEX `airport_icao_idx` ON `runways` (`airportIcao`);--> statement-breakpoint
CREATE INDEX `ident_idx` ON `waypoints` (`ident`);