/*
  Warnings:

  - A unique constraint covering the columns `[staffMemberId,sessionTypeId,listId]` on the table `StaffDuty` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "StaffDuty.staffMemberId_sessionTypeId_listId_unique" ON "StaffDuty"("staffMemberId", "sessionTypeId", "listId");
