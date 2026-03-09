-- CreateTable
CREATE TABLE "Porduct" (
    "id" SERIAL NOT NULL,
    "product_name" TEXT NOT NULL,
    "product_quanitity" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Porduct_pkey" PRIMARY KEY ("id")
);
