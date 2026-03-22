/*
  Warnings:

  - You are about to drop the column `user_id` on the `warehouses` table. All the data in the column will be lost.

*/
-- DropIndex
DROP INDEX "warehouses_user_id_key";

-- AlterTable
ALTER TABLE "warehouses" DROP COLUMN "user_id";
