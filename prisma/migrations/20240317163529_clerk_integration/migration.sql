-- AlterTable
ALTER TABLE "User" ADD COLUMN     "clerkId" TEXT,
ADD COLUMN     "lastLogin" TIMESTAMP(3),
ALTER COLUMN "password" DROP NOT NULL;

-- CreateIndex
CREATE INDEX "User_clerkId_idx" ON "User"("clerkId");
