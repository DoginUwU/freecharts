PRAGMA foreign_keys=OFF;--> statement-breakpoint
CREATE TABLE `__new_airports` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`icao` text NOT NULL,
	`name` text DEFAULT '' NOT NULL,
	`elevation` integer NOT NULL,
	`lat` real NOT NULL,
	`lon` real NOT NULL
);
--> statement-breakpoint
INSERT INTO `__new_airports`("id", "icao", "name", "elevation", "lat", "lon") SELECT "id", "icao", "name", "elevation", "lat", "lon" FROM `airports`;--> statement-breakpoint
DROP TABLE `airports`;--> statement-breakpoint
ALTER TABLE `__new_airports` RENAME TO `airports`;--> statement-breakpoint
PRAGMA foreign_keys=ON;--> statement-breakpoint
CREATE UNIQUE INDEX `airports_icao_unique` ON `airports` (`icao`);--> statement-breakpoint
CREATE INDEX `icao_idx` ON `airports` (`icao`);--> statement-breakpoint
CREATE TABLE `__new_gates` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`name` text NOT NULL,
	`airportIcao` text,
	`lat` real NOT NULL,
	`lon` real NOT NULL,
	FOREIGN KEY (`airportIcao`) REFERENCES `airports`(`icao`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
INSERT INTO `__new_gates`("id", "name", "airportIcao", "lat", "lon") SELECT "id", "name", "airportIcao", "lat", "lon" FROM `gates`;--> statement-breakpoint
DROP TABLE `gates`;--> statement-breakpoint
ALTER TABLE `__new_gates` RENAME TO `gates`;--> statement-breakpoint
CREATE INDEX `gate_airport_icao_idx` ON `gates` (`airportIcao`);--> statement-breakpoint
CREATE TABLE `__new_runways` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`widthMetres` real NOT NULL,
	`lat` real NOT NULL,
	`lon` real NOT NULL,
	`number` text NOT NULL,
	`airportIcao` text,
	FOREIGN KEY (`airportIcao`) REFERENCES `airports`(`icao`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
INSERT INTO `__new_runways`("id", "widthMetres", "lat", "lon", "number", "airportIcao") SELECT "id", "widthMetres", "lat", "lon", "number", "airportIcao" FROM `runways`;--> statement-breakpoint
DROP TABLE `runways`;--> statement-breakpoint
ALTER TABLE `__new_runways` RENAME TO `runways`;--> statement-breakpoint
CREATE INDEX `airport_icao_idx` ON `runways` (`airportIcao`);--> statement-breakpoint
CREATE TABLE `__new_waypoints` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`ident` text NOT NULL,
	`lat` real NOT NULL,
	`lon` real NOT NULL,
	`airport` text NOT NULL,
	`region` text NOT NULL
);
--> statement-breakpoint
INSERT INTO `__new_waypoints`("id", "ident", "lat", "lon", "airport", "region") SELECT "id", "ident", "lat", "lon", "airport", "region" FROM `waypoints`;--> statement-breakpoint
DROP TABLE `waypoints`;--> statement-breakpoint
ALTER TABLE `__new_waypoints` RENAME TO `waypoints`;--> statement-breakpoint
CREATE INDEX `ident_idx` ON `waypoints` (`ident`);