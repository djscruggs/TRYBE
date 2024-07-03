-- DropForeignKey
ALTER TABLE "CheckIn" DROP CONSTRAINT "CheckIn_memberChallengeId_fkey";

-- AddForeignKey
ALTER TABLE "CheckIn" ADD CONSTRAINT "CheckIn_memberChallengeId_fkey" FOREIGN KEY ("memberChallengeId") REFERENCES "MemberChallenge"("id") ON DELETE CASCADE ON UPDATE CASCADE;
