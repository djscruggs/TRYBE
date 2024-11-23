-- CreateTable
CREATE TABLE "CategoriesOnChallenges" (
    "challengeId" INTEGER NOT NULL,
    "categoryId" INTEGER NOT NULL,

    CONSTRAINT "CategoriesOnChallenges_pkey" PRIMARY KEY ("challengeId","categoryId")
);

-- AddForeignKey
ALTER TABLE "CategoriesOnChallenges" ADD CONSTRAINT "CategoriesOnChallenges_challengeId_fkey" FOREIGN KEY ("challengeId") REFERENCES "Challenge"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CategoriesOnChallenges" ADD CONSTRAINT "CategoriesOnChallenges_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "Category"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
