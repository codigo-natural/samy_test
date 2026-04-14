-- DropForeignKey
ALTER TABLE "posts" DROP CONSTRAINT "posts_authorUserId_fkey";

-- AddForeignKey
ALTER TABLE "posts" ADD CONSTRAINT "posts_authorUserId_fkey" FOREIGN KEY ("authorUserId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
