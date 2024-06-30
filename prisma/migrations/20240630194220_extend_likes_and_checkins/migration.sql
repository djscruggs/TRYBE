/*
  Warnings:

  - The `data` column on the `CheckIn` table would be dropped and recreated. This will lead to data loss if there is data in the column.

*/
-- AlterTable
ALTER TABLE "CheckIn" ADD COLUMN     "likeCount" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "note" TEXT,
DROP COLUMN "data",
ADD COLUMN     "data" JSONB;

-- AlterTable
ALTER TABLE "Like" ADD COLUMN     "checkinId" INTEGER;

-- AddForeignKey
ALTER TABLE "Like" ADD CONSTRAINT "Like_checkinId_fkey" FOREIGN KEY ("checkinId") REFERENCES "CheckIn"("id") ON DELETE CASCADE ON UPDATE CASCADE;
