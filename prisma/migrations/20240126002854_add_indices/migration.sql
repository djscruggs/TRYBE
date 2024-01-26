-- AlterTable
ALTER TABLE "MemberChallenge" ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;

-- CreateIndex
CREATE INDEX "Challenge_userId_idx" ON "Challenge"("userId");

-- CreateIndex
CREATE INDEX "Challenge_userId_updatedAt_idx" ON "Challenge"("userId", "updatedAt");

-- CreateIndex
CREATE INDEX "MemberChallenge_userId_idx" ON "MemberChallenge"("userId");

-- CreateIndex
CREATE INDEX "MemberChallenge_userId_createdAt_idx" ON "MemberChallenge"("userId", "createdAt");

-- CreateIndex
CREATE INDEX "Post_userId_idx" ON "Post"("userId");

-- CreateIndex
CREATE INDEX "Post_userId_createdAt_idx" ON "Post"("userId", "createdAt");
