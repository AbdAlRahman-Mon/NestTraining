/*
  Warnings:

  - Made the column `sessionId` on table `user_sessions` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "user_sessions" ALTER COLUMN "sessionId" SET NOT NULL;
