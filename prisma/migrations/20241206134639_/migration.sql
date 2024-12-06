/*
  Warnings:

  - You are about to drop the column `published` on the `Challenge` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Challenge" DROP COLUMN "published",
ADD COLUMN     "status" "ChallengeStatus" NOT NULL DEFAULT 'DRAFT';

UPDATE "Challenge" SET "status" = 'PUBLISHED';
