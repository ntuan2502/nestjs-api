/*
  Warnings:

  - A unique constraint covering the columns `[taxCode]` on the table `Office` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `internationalName` to the `Office` table without a default value. This is not possible if the table is not empty.
  - Added the required column `shortName` to the `Office` table without a default value. This is not possible if the table is not empty.
  - Added the required column `taxCode` to the `Office` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Office" ADD COLUMN     "internationalName" TEXT NOT NULL,
ADD COLUMN     "shortName" TEXT NOT NULL,
ADD COLUMN     "taxCode" TEXT NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "Office_taxCode_key" ON "Office"("taxCode");
