-- DropForeignKey
ALTER TABLE "BankAccount" DROP CONSTRAINT "BankAccount_bankId_fkey";

-- AlterTable
ALTER TABLE "BankAccount" ALTER COLUMN "bankId" DROP NOT NULL;

-- AddForeignKey
ALTER TABLE "BankAccount" ADD CONSTRAINT "BankAccount_bankId_fkey" FOREIGN KEY ("bankId") REFERENCES "Bank"("id") ON DELETE SET NULL ON UPDATE CASCADE;
