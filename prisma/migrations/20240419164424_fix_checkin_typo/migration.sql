/*
  Warnings:

  - You are about to drop the column `lastCheckin` on the `MemberChallenge` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "MemberChallenge" DROP COLUMN "lastCheckin",
ADD COLUMN     "lastCheckIn" TIMESTAMP(3);
