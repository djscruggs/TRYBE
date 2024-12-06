-- DropForeignKey
ALTER TABLE "CategoriesOnChallenges" DROP CONSTRAINT "CategoriesOnChallenges_challengeId_fkey";

-- AddForeignKey
ALTER TABLE "CategoriesOnChallenges" ADD CONSTRAINT "CategoriesOnChallenges_challengeId_fkey" FOREIGN KEY ("challengeId") REFERENCES "Challenge"("id") ON DELETE CASCADE ON UPDATE CASCADE;
