/*
  Warnings:

  - A unique constraint covering the columns `[hashedToken]` on the table `user_sessions` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `hashedToken` to the `user_sessions` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "user_sessions" ADD COLUMN     "hashedToken" TEXT NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "user_sessions_hashedToken_key" ON "user_sessions"("hashedToken");
