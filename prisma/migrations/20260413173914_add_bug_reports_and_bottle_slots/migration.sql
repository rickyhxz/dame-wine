-- AlterTable
ALTER TABLE "TastingEvent" ADD COLUMN "mainVariable" TEXT;
ALTER TABLE "TastingEvent" ADD COLUMN "tastingTheme" TEXT;

-- CreateTable
CREATE TABLE "EventBottleSlot" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "eventId" INTEGER NOT NULL,
    "slotNumber" INTEGER NOT NULL,
    "category" TEXT NOT NULL,
    "description" TEXT,
    "signedUpBy" INTEGER,
    "wineName" TEXT,
    CONSTRAINT "EventBottleSlot_eventId_fkey" FOREIGN KEY ("eventId") REFERENCES "TastingEvent" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "EventBottleSlot_signedUpBy_fkey" FOREIGN KEY ("signedUpBy") REFERENCES "User" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "BugReport" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "userId" INTEGER NOT NULL,
    "description" TEXT NOT NULL,
    "urgency" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'OPEN',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "resolvedAt" DATETIME,
    CONSTRAINT "BugReport_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "EventBottleSlot_eventId_slotNumber_key" ON "EventBottleSlot"("eventId", "slotNumber");
