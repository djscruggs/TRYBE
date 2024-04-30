-- AlterTable
ALTER TABLE "Challenge" ADD COLUMN     "coverPhotoMeta" JSONB,
ADD COLUMN     "videoMeta" JSONB;

-- AlterTable
ALTER TABLE "Note" ADD COLUMN     "imageMeta" JSONB,
ADD COLUMN     "videoMeta" JSONB;

-- AlterTable
ALTER TABLE "Post" ADD COLUMN     "imageMeta" JSONB,
ADD COLUMN     "videoMeta" JSONB;
