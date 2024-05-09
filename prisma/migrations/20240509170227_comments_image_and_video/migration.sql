-- AlterTable
ALTER TABLE "Comment" ADD COLUMN     "imageMeta" JSONB,
ADD COLUMN     "videoMeta" JSONB;

-- CreateIndex
CREATE INDEX "Like_threadId_idx" ON "Like"("threadId");
