import { SetMetadata } from "@nestjs/common";

export const WAREHOUSE_PERMISSIONS_KEY = "warehouse_permissions";

export const WarehousePermissions = (...permissions: string[]) =>
    SetMetadata(WAREHOUSE_PERMISSIONS_KEY, permissions);