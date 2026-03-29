-- CreateTable
CREATE TABLE "permissions" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,

    CONSTRAINT "permissions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "user_warehouse_permissions" (
    "user_id" INTEGER NOT NULL,
    "warehouse_id" INTEGER NOT NULL,
    "permission_id" INTEGER NOT NULL,

    CONSTRAINT "user_warehouse_permissions_pkey" PRIMARY KEY ("user_id","warehouse_id","permission_id")
);

-- CreateIndex
CREATE UNIQUE INDEX "permissions_name_key" ON "permissions"("name");

-- AddForeignKey
ALTER TABLE "user_warehouse_permissions" ADD CONSTRAINT "user_warehouse_permissions_user_id_warehouse_id_fkey" FOREIGN KEY ("user_id", "warehouse_id") REFERENCES "user_warehouse"("user_id", "warehouse_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_warehouse_permissions" ADD CONSTRAINT "user_warehouse_permissions_permission_id_fkey" FOREIGN KEY ("permission_id") REFERENCES "permissions"("id") ON DELETE CASCADE ON UPDATE CASCADE;
