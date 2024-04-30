-- DropForeignKey
ALTER TABLE "CheckIn" DROP CONSTRAINT "CheckIn_challengeId_fkey";

-- DropForeignKey
ALTER TABLE "CheckIn" DROP CONSTRAINT "CheckIn_userId_fkey";

-- AddForeignKey
ALTER TABLE "CheckIn" ADD CONSTRAINT "CheckIn_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CheckIn" ADD CONSTRAINT "CheckIn_challengeId_fkey" FOREIGN KEY ("challengeId") REFERENCES "Challenge"("id") ON DELETE CASCADE ON UPDATE CASCADE;
