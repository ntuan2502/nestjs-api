/*
  Warnings:

  - Added the required column `accountName` to the `BankAccount` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "BankAccount" ADD COLUMN     "accountName" TEXT NOT NULL;
