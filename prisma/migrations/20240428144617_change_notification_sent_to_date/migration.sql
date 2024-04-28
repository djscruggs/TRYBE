/*
  Warnings:

  - You are about to drop the column `notificationSent` on the `Post` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Post" DROP COLUMN "notificationSent",
ADD COLUMN     "notificationSentOn" TIMESTAMP(3);
