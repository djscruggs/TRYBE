/*
  Warnings:

  - You are about to drop the column `image` on the `Post` table. All the data in the column will be lost.
  - You are about to drop the column `video` on the `Post` table. All the data in the column will be lost.
  - You are about to drop the column `image` on the `Thread` table. All the data in the column will be lost.
  - You are about to drop the column `video` on the `Thread` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Post" DROP COLUMN "image",
DROP COLUMN "video";

-- AlterTable
ALTER TABLE "Thread" DROP COLUMN "image",
DROP COLUMN "video";
