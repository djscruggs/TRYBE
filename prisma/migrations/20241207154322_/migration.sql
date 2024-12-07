/*
  Warnings:

  - You are about to drop the column `template` on the `Challenge` table. All the data in the column will be lost.
  - You are about to drop the `CategoriesOnChallengeTemplates` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `ChallengeTemplate` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "CategoriesOnChallengeTemplates" DROP CONSTRAINT "CategoriesOnChallengeTemplates_categoryId_fkey";

-- DropForeignKey
ALTER TABLE "CategoriesOnChallengeTemplates" DROP CONSTRAINT "CategoriesOnChallengeTemplates_challengeTemplateId_fkey";

-- DropForeignKey
ALTER TABLE "ChallengeTemplate" DROP CONSTRAINT "ChallengeTemplate_userId_fkey";

-- AlterTable
ALTER TABLE "Challenge" DROP COLUMN "template";

-- DropTable
DROP TABLE "CategoriesOnChallengeTemplates";

-- DropTable
DROP TABLE "ChallengeTemplate";
