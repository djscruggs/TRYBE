-- AlterTable
ALTER TABLE "MemberChallenge" ADD COLUMN     "cohortId" INTEGER;

-- CreateTable
CREATE TABLE "ChallengeCohort" (
    "id" SERIAL NOT NULL,
    "challengeId" INTEGER NOT NULL,
    "dayNumber" INTEGER NOT NULL DEFAULT 1,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "startAt" TIMESTAMP(3),

    CONSTRAINT "ChallengeCohort_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "MemberChallenge" ADD CONSTRAINT "MemberChallenge_cohortId_fkey" FOREIGN KEY ("cohortId") REFERENCES "ChallengeCohort"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ChallengeCohort" ADD CONSTRAINT "ChallengeCohort_challengeId_fkey" FOREIGN KEY ("challengeId") REFERENCES "Challenge"("id") ON DELETE CASCADE ON UPDATE CASCADE;
