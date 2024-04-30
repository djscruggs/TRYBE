-- DropForeignKey
ALTER TABLE "Like" DROP CONSTRAINT "Like_challengeId_fkey";

-- DropForeignKey
ALTER TABLE "Like" DROP CONSTRAINT "Like_commentId_fkey";

-- DropForeignKey
ALTER TABLE "Like" DROP CONSTRAINT "Like_noteId_fkey";

-- DropForeignKey
ALTER TABLE "Like" DROP CONSTRAINT "Like_postId_fkey";

-- DropForeignKey
ALTER TABLE "MemberChallenge" DROP CONSTRAINT "MemberChallenge_challengeId_fkey";

-- DropForeignKey
ALTER TABLE "Post" DROP CONSTRAINT "Post_challengeId_fkey";

-- DropForeignKey
ALTER TABLE "Post" DROP CONSTRAINT "Post_userId_fkey";

-- AddForeignKey
ALTER TABLE "Post" ADD CONSTRAINT "Post_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Post" ADD CONSTRAINT "Post_challengeId_fkey" FOREIGN KEY ("challengeId") REFERENCES "Challenge"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MemberChallenge" ADD CONSTRAINT "MemberChallenge_challengeId_fkey" FOREIGN KEY ("challengeId") REFERENCES "Challenge"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Like" ADD CONSTRAINT "Like_postId_fkey" FOREIGN KEY ("postId") REFERENCES "Post"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Like" ADD CONSTRAINT "Like_noteId_fkey" FOREIGN KEY ("noteId") REFERENCES "Note"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Like" ADD CONSTRAINT "Like_challengeId_fkey" FOREIGN KEY ("challengeId") REFERENCES "Challenge"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Like" ADD CONSTRAINT "Like_commentId_fkey" FOREIGN KEY ("commentId") REFERENCES "Comment"("id") ON DELETE CASCADE ON UPDATE CASCADE;
