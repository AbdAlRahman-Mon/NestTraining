-- DropForeignKey
ALTER TABLE "warehouses" DROP CONSTRAINT "warehouses_user_id_fkey";

-- CreateTable
CREATE TABLE "user_warehouse" (
    "user_id" INTEGER NOT NULL,
    "warehouse_id" INTEGER NOT NULL,
    "role" TEXT NOT NULL,

    CONSTRAINT "user_warehouse_pkey" PRIMARY KEY ("user_id","warehouse_id")
);

-- AddForeignKey
ALTER TABLE "user_warehouse" ADD CONSTRAINT "user_warehouse_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_warehouse" ADD CONSTRAINT "user_warehouse_warehouse_id_fkey" FOREIGN KEY ("warehouse_id") REFERENCES "warehouses"("id") ON DELETE CASCADE ON UPDATE CASCADE;
