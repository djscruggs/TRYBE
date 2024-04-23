-- AlterTable
ALTER TABLE "Comment" ADD COLUMN     "replyToId" INTEGER,
ADD COLUMN     "threadDepth" INTEGER NOT NULL DEFAULT 0;

-- AddForeignKey
ALTER TABLE "Comment" ADD CONSTRAINT "Comment_replyToId_fkey" FOREIGN KEY ("replyToId") REFERENCES "Comment"("id") ON DELETE SET NULL ON UPDATE CASCADE;
