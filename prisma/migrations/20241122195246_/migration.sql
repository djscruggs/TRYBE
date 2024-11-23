/*
  Warnings:

  - You are about to drop the column `category` on the `Challenge` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Challenge" DROP COLUMN "category";

-- DropEnum
DROP TYPE "Category";
