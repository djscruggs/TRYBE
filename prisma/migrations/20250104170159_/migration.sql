/*
  Warnings:

  - You are about to drop the `ChallengeCohort` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "ChallengeCohort" DROP CONSTRAINT "ChallengeCohort_challengeId_fkey";

-- DropForeignKey
ALTER TABLE "MemberChallenge" DROP CONSTRAINT "MemberChallenge_cohortId_fkey";

-- AlterTable
ALTER TABLE "CheckIn" ADD COLUMN     "cohortId" INTEGER;

-- AlterTable
ALTER TABLE "Comment" ADD COLUMN     "cohortId" INTEGER;

-- DropTable
DROP TABLE "ChallengeCohort";

-- CreateTable
CREATE TABLE "Cohort" (
    "id" SERIAL NOT NULL,
    "challengeId" INTEGER NOT NULL,
    "dayNumber" INTEGER NOT NULL DEFAULT 1,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "startAt" TIMESTAMP(3),

    CONSTRAINT "Cohort_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "MemberChallenge" ADD CONSTRAINT "MemberChallenge_cohortId_fkey" FOREIGN KEY ("cohortId") REFERENCES "Cohort"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Cohort" ADD CONSTRAINT "Cohort_challengeId_fkey" FOREIGN KEY ("challengeId") REFERENCES "Challenge"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CheckIn" ADD CONSTRAINT "CheckIn_cohortId_fkey" FOREIGN KEY ("cohortId") REFERENCES "Cohort"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Comment" ADD CONSTRAINT "Comment_cohortId_fkey" FOREIGN KEY ("cohortId") REFERENCES "Cohort"("id") ON DELETE CASCADE ON UPDATE CASCADE;
