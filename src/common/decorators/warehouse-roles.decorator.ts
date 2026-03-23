import { SetMetadata } from "@nestjs/common";

export const WAREHOUSE_ROLES_KEY = 'warehouse_roles';

export const WarehouseRoles = (...roles: string[]) => SetMetadata(WAREHOUSE_ROLES_KEY, roles);