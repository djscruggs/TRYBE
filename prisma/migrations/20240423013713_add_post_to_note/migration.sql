-- AlterTable
ALTER TABLE "Note" ADD COLUMN     "postId" INTEGER;

-- AddForeignKey
ALTER TABLE "Note" ADD CONSTRAINT "Note_postId_fkey" FOREIGN KEY ("postId") REFERENCES "Post"("id") ON DELETE SET NULL ON UPDATE CASCADE;
