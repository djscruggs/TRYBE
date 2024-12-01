-- CreateTable
CREATE TABLE "ChallengeTemplate" (
    "id" SERIAL NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "publishAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "name" TEXT NOT NULL,
    "published" BOOLEAN NOT NULL DEFAULT false,
    "userId" INTEGER NOT NULL,
    "numDays" INTEGER NOT NULL DEFAULT 30,
    "color" TEXT,
    "description" TEXT,
    "icon" TEXT,
    "frequency" "Frequency" NOT NULL DEFAULT 'DAILY',
    "mission" TEXT,
    "video" TEXT,
    "coverPhotoMeta" JSONB,
    "videoMeta" JSONB,

    CONSTRAINT "ChallengeTemplate_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CategoriesOnChallengeTemplates" (
    "challengeTemplateId" INTEGER NOT NULL,
    "categoryId" INTEGER NOT NULL,

    CONSTRAINT "CategoriesOnChallengeTemplates_pkey" PRIMARY KEY ("challengeTemplateId","categoryId")
);

-- AddForeignKey
ALTER TABLE "ChallengeTemplate" ADD CONSTRAINT "ChallengeTemplate_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CategoriesOnChallengeTemplates" ADD CONSTRAINT "CategoriesOnChallengeTemplates_challengeTemplateId_fkey" FOREIGN KEY ("challengeTemplateId") REFERENCES "ChallengeTemplate"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CategoriesOnChallengeTemplates" ADD CONSTRAINT "CategoriesOnChallengeTemplates_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "Category"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
