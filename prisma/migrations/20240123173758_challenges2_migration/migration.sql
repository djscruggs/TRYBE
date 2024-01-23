/*
  Warnings:

  - You are about to drop the column `body` on the `Challenge` table. All the data in the column will be lost.

*/
-- CreateEnum
CREATE TYPE "Frequency" AS ENUM ('DAILY', 'WEEKDAYS', 'ALTERNATING', 'WEEKLY', 'CUSTOM');

-- AlterTable
ALTER TABLE "Challenge" DROP COLUMN "body",
ADD COLUMN     "color" TEXT,
ADD COLUMN     "coverPhoto" TEXT,
ADD COLUMN     "description" BYTEA,
ADD COLUMN     "endAt" TIMESTAMP(3),
ADD COLUMN     "icon" TEXT,
ADD COLUMN     "reminders" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "startAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "syncCalendar" BOOLEAN NOT NULL DEFAULT false;
