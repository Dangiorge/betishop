-- Additive shop workflows: store sales, assigned staff, bank tracking,
-- public customer feedback, and store-level stock reconciliation.

ALTER TYPE "Role" ADD VALUE IF NOT EXISTS 'SALES_PERSON';
CREATE TYPE "PaymentMethod" AS ENUM ('CASH', 'BANK', 'MOBILE_MONEY', 'OTHER');

ALTER TABLE "Tenant" ADD COLUMN "currency" TEXT NOT NULL DEFAULT 'ETB';
ALTER TABLE "User" ADD COLUMN "assignedStoreId" TEXT;
ALTER TABLE "Sale" ADD COLUMN "batchId" TEXT;
ALTER TABLE "Sale" ADD COLUMN "costAtSale" DECIMAL(12,2);
ALTER TABLE "Expense" ADD COLUMN "customCategory" TEXT;
ALTER TABLE "Expense" ADD COLUMN "paymentMethod" "PaymentMethod" NOT NULL DEFAULT 'CASH';
ALTER TABLE "Expense" ADD COLUMN "bankAccountId" TEXT;
ALTER TABLE "StockCount" ADD COLUMN "storeId" TEXT;
ALTER TABLE "ClosingPeriod" ADD COLUMN "costOfGoods" DECIMAL(12,2) NOT NULL DEFAULT 0;

CREATE TABLE "BankAccount" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "bankName" TEXT NOT NULL,
    "accountLast4" TEXT,
    "openingBalance" DECIMAL(12,2) NOT NULL DEFAULT 0,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "BankAccount_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "SaleBatch" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "storeId" TEXT NOT NULL,
    "employeeId" TEXT NOT NULL,
    "paymentMethod" "PaymentMethod" NOT NULL,
    "bankAccountId" TEXT,
    "transactionReference" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "SaleBatch_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "StoreFeedback" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "name" TEXT,
    "rating" INTEGER NOT NULL,
    "message" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "StoreFeedback_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "BankAccount_tenantId_name_key" ON "BankAccount"("tenantId", "name");
CREATE INDEX "BankAccount_tenantId_idx" ON "BankAccount"("tenantId");
CREATE INDEX "SaleBatch_tenantId_idx" ON "SaleBatch"("tenantId");
CREATE INDEX "SaleBatch_storeId_createdAt_idx" ON "SaleBatch"("storeId", "createdAt");
CREATE INDEX "StoreFeedback_tenantId_createdAt_idx" ON "StoreFeedback"("tenantId", "createdAt");

ALTER TABLE "User" ADD CONSTRAINT "User_assignedStoreId_fkey" FOREIGN KEY ("assignedStoreId") REFERENCES "Store"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "Sale" ADD CONSTRAINT "Sale_batchId_fkey" FOREIGN KEY ("batchId") REFERENCES "SaleBatch"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "Expense" ADD CONSTRAINT "Expense_bankAccountId_fkey" FOREIGN KEY ("bankAccountId") REFERENCES "BankAccount"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "StockCount" ADD CONSTRAINT "StockCount_storeId_fkey" FOREIGN KEY ("storeId") REFERENCES "Store"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "BankAccount" ADD CONSTRAINT "BankAccount_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "SaleBatch" ADD CONSTRAINT "SaleBatch_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "SaleBatch" ADD CONSTRAINT "SaleBatch_storeId_fkey" FOREIGN KEY ("storeId") REFERENCES "Store"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "SaleBatch" ADD CONSTRAINT "SaleBatch_employeeId_fkey" FOREIGN KEY ("employeeId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "SaleBatch" ADD CONSTRAINT "SaleBatch_bankAccountId_fkey" FOREIGN KEY ("bankAccountId") REFERENCES "BankAccount"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "StoreFeedback" ADD CONSTRAINT "StoreFeedback_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
