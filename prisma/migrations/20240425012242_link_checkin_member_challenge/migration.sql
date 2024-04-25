/*
  Warnings:

  - Added the required column `memberChallengeId` to the `CheckIn` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "CheckIn" ADD COLUMN     "memberChallengeId" INTEGER NOT NULL;

-- AddForeignKey
ALTER TABLE "CheckIn" ADD CONSTRAINT "CheckIn_memberChallengeId_fkey" FOREIGN KEY ("memberChallengeId") REFERENCES "MemberChallenge"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
