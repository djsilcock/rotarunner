-- RedefineTables
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_TheatreList" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "day" DATETIME NOT NULL,
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
CREATE TABLE "new_Token" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "hashedToken" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "expiresAt" DATETIME NOT NULL,
    "sentTo" TEXT NOT NULL,
    "userId" INTEGER NOT NULL,
    FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_Token" ("createdAt", "expiresAt", "hashedToken", "id", "sentTo", "type", "updatedAt", "userId") SELECT "createdAt", "expiresAt", "hashedToken", "id", "sentTo", "type", "updatedAt", "userId" FROM "Token";
DROP TABLE "Token";
ALTER TABLE "new_Token" RENAME TO "Token";
CREATE UNIQUE INDEX "Token.hashedToken_type_unique" ON "Token"("hashedToken", "type");
CREATE TABLE "new_StaffContract" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "staffMemberId" INTEGER NOT NULL,
    "employer" TEXT NOT NULL,
    "staffGroupId" TEXT NOT NULL,
    "startDate" DATETIME NOT NULL,
    "endDate" DATETIME NOT NULL,
    FOREIGN KEY ("staffMemberId") REFERENCES "StaffMember" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    FOREIGN KEY ("staffGroupId") REFERENCES "StaffGroup" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_StaffContract" ("employer", "endDate", "id", "staffGroupId", "staffMemberId", "startDate") SELECT "employer", "endDate", "id", "staffGroupId", "staffMemberId", "startDate" FROM "StaffContract";
DROP TABLE "StaffContract";
ALTER TABLE "new_StaffContract" RENAME TO "StaffContract";
CREATE TABLE "new_StaffInRotations" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "staffMemberId" INTEGER NOT NULL,
    "rotationId" INTEGER NOT NULL,
    "startDate" DATETIME NOT NULL,
    "endDate" DATETIME NOT NULL,
    FOREIGN KEY ("staffMemberId") REFERENCES "StaffMember" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    FOREIGN KEY ("rotationId") REFERENCES "StaffRotation" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_StaffInRotations" ("endDate", "id", "rotationId", "staffMemberId", "startDate") SELECT "endDate", "id", "rotationId", "staffMemberId", "startDate" FROM "StaffInRotations";
DROP TABLE "StaffInRotations";
ALTER TABLE "new_StaffInRotations" RENAME TO "StaffInRotations";
CREATE TABLE "new_StaffDuty" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "staffMemberId" INTEGER NOT NULL,
    "listId" INTEGER NOT NULL,
    FOREIGN KEY ("staffMemberId") REFERENCES "StaffMember" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    FOREIGN KEY ("listId") REFERENCES "TheatreList" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_StaffDuty" ("id", "listId", "staffMemberId") SELECT "id", "listId", "staffMemberId" FROM "StaffDuty";
DROP TABLE "StaffDuty";
ALTER TABLE "new_StaffDuty" RENAME TO "StaffDuty";
PRAGMA foreign_key_check;
PRAGMA foreign_keys=ON;
