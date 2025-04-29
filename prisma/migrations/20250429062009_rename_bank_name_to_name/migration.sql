/*
  Warnings:

  - You are about to drop the column `bankName` on the `Bank` table. All the data in the column will be lost.
  - Added the required column `name` to the `Bank` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Bank" DROP COLUMN "bankName",
ADD COLUMN     "name" TEXT NOT NULL;
