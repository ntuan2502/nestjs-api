/*
  Warnings:

  - You are about to drop the column `warrantyUntil` on the `Asset` table. All the data in the column will be lost.
  - Added the required column `warrantyDuration` to the `Asset` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Asset" DROP COLUMN "warrantyUntil",
ADD COLUMN     "warrantyDuration" TEXT NOT NULL;
