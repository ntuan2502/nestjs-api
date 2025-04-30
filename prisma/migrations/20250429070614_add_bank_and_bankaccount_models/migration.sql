/*
  Warnings:

  - You are about to drop the column `accountNumber` on the `Bank` table. All the data in the column will be lost.
  - You are about to drop the column `supplierId` on the `Bank` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "Bank" DROP CONSTRAINT "Bank_supplierId_fkey";

-- AlterTable
ALTER TABLE "Bank" DROP COLUMN "accountNumber",
DROP COLUMN "supplierId",
ADD COLUMN     "shortName" TEXT;

-- CreateTable
CREATE TABLE "BankAccount" (
    "id" SERIAL NOT NULL,
    "accountNumber" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),
    "supplierId" INTEGER,
    "bankId" INTEGER NOT NULL,

    CONSTRAINT "BankAccount_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "BankAccount" ADD CONSTRAINT "BankAccount_supplierId_fkey" FOREIGN KEY ("supplierId") REFERENCES "Supplier"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BankAccount" ADD CONSTRAINT "BankAccount_bankId_fkey" FOREIGN KEY ("bankId") REFERENCES "Bank"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
