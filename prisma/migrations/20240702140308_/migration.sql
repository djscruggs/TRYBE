/*
  Warnings:

  - You are about to drop the column `image` on the `Note` table. All the data in the column will be lost.
  - You are about to drop the column `video` on the `Note` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Note" DROP COLUMN "image",
DROP COLUMN "video";
