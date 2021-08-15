-- RedefineTables
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_TheatreList" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "day" TEXT NOT NULL,
    "theatreId" TEXT NOT NULL,
    "surgeonId" INTEGER,
    "specialtyId" TEXT,
    "sessionTypeId" TEXT NOT NULL,
    FOREIGN KEY ("theatreId") REFERENCES "Theatre" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    FOREIGN KEY ("surgeonId") REFERENCES "Surgeon" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    FOREIGN KEY ("specialtyId") REFERENCES "Specialty" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    FOREIGN KEY ("sessionTypeId") REFERENCES "SessionType" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_TheatreList" ("day", "id", "sessionTypeId", "specialtyId", "surgeonId", "theatreId") SELECT "day", "id", "sessionTypeId", "specialtyId", "surgeonId", "theatreId" FROM "TheatreList";
DROP TABLE "TheatreList";
ALTER TABLE "new_TheatreList" RENAME TO "TheatreList";
PRAGMA foreign_key_check;
PRAGMA foreign_keys=ON;
