-- AlterTable
ALTER TABLE "MemberChallenge" ADD COLUMN     "notificationHour" INTEGER,
ADD COLUMN     "notificationMinute" INTEGER,
ADD COLUMN     "startAt" TIMESTAMP(3);
