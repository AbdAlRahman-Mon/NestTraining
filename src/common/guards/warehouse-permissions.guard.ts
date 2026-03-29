import { Injectable, CanActivate, ExecutionContext, ForbiddenException, BadRequestException } from "@nestjs/common";
import { Reflector } from "@nestjs/core";
import { PrismaService } from "src/prisma.service";
import { WAREHOUSE_PERMISSIONS_KEY } from "../decorators/warehouse-permissions.decorator";

@Injectable()
export class WarehousePermissionsGuard implements CanActivate {
    constructor(
        private readonly reflector: Reflector,
        private readonly prisma: PrismaService,
    ) {}

    async canActivate(context: ExecutionContext): Promise<boolean> {

        const requiredPermissions = this.reflector.getAllAndOverride<string[]>(WAREHOUSE_PERMISSIONS_KEY, [
            context.getHandler(),
            context.getClass(),
        ]);

        if (!requiredPermissions || requiredPermissions.length === 0) {
            return true; // No permissions required, allow access
        }

        const request = context.switchToHttp().getRequest();
        const user = request.user;
        
        if(!user?.user_id){
            throw new BadRequestException("User identification missing");
        }

        if(user.is_admin) return true; // Admin has all permissions

        const warehouseId = 
        
        Number(request.params?.warehouse_id) ||
        Number(request.query?.warehouse_id) ||
        Number(request.body?.warehouse_id);

        if (!warehouseId || isNaN(warehouseId)) {
            
            throw new BadRequestException('A valid warehouse_id is required.');
        }

        const userWarehouse = await this.prisma.userWarehouse.findUnique({
            where: {
                user_id_warehouse_id: {
                    user_id: user.user_id,
                    warehouse_id: warehouseId,
                }
            },
            include: {
                permissions:{
                    include:{
                        permission:{
                            select:{name: true}
                        }
                    }
                }
            }
        })

        if(!userWarehouse){
            throw new ForbiddenException('You are not assigned to this warehouse.');
        }

        const grantedPermissions = new Set(
            userWarehouse.permissions.map((p) => p.permission.name)
        );

        const missing = requiredPermissions.filter(p => !grantedPermissions.has(p));

        if(missing.length > 0){
             throw new ForbiddenException(
                `Missing permission(s): [${missing.join(', ')}]. ` +
                `Your permissions: [${[...grantedPermissions].join(', ')}].`,
            );
        }

        // 8. Attach to request so controllers/services can read it without a second query
        request.userPermissions = [...grantedPermissions];

        return true;

    }
}

