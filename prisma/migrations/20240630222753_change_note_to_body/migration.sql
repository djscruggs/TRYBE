/*
  Warnings:

  - You are about to drop the column `note` on the `CheckIn` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "CheckIn" DROP COLUMN "note",
ADD COLUMN     "body" TEXT;
