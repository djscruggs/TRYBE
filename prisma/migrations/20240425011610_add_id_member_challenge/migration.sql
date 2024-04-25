/*
  Warnings:

  - The primary key for the `MemberChallenge` table will be changed. If it partially fails, the table could be left without primary key constraint.

*/
-- AlterTable
ALTER TABLE "MemberChallenge" DROP CONSTRAINT "MemberChallenge_pkey",
ADD COLUMN     "id" SERIAL NOT NULL,
ADD CONSTRAINT "MemberChallenge_pkey" PRIMARY KEY ("id");

-- CreateIndex
CREATE INDEX "MemberChallenge_challengeId_idx" ON "MemberChallenge"("challengeId");
