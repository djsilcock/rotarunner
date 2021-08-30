/*
  Warnings:

  - Added the required column `sessionTypeId` to the `StaffDuty` table without a default value. This is not possible if the table is not empty.

*/
-- RedefineTables
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_StaffDuty" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "staffMemberId" INTEGER NOT NULL,
    "sessionTypeId" TEXT NOT NULL,
    "listId" INTEGER NOT NULL,
    FOREIGN KEY ("staffMemberId") REFERENCES "StaffMember" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    FOREIGN KEY ("sessionTypeId") REFERENCES "SessionType" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    FOREIGN KEY ("listId") REFERENCES "TheatreList" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_StaffDuty" ("id", "listId", "staffMemberId") SELECT "id", "listId", "staffMemberId" FROM "StaffDuty";
DROP TABLE "StaffDuty";
ALTER TABLE "new_StaffDuty" RENAME TO "StaffDuty";
PRAGMA foreign_key_check;
PRAGMA foreign_keys=ON;
