import { Injectable,CanActivate,ExecutionContext,BadRequestException,ForbiddenException } from "@nestjs/common";
import { Reflector } from "@nestjs/core";
import { PrismaService } from "src/prisma.service";
import { WAREHOUSE_ROLES_KEY } from "../decorators/warehouse-roles.decorator";


@Injectable()

export class WarehouseRolesGuard implements CanActivate{

    constructor(
        private reflector: Reflector,
        private prisma: PrismaService
    ){}
    
    async canActivate(context: ExecutionContext): Promise<boolean> {

        const requiredRoles = this.reflector.getAllAndOverride<string []>(WAREHOUSE_ROLES_KEY,[
            context.getHandler(),
            context.getClass(),
            ],
        );

        console.log('WAREHOUSE_ROLES_KEY:', WAREHOUSE_ROLES_KEY);
        console.log('Required Roles:', requiredRoles);
        
        if(!requiredRoles || requiredRoles.length === 0){
            console.log('No roles required, allowing through');
            return true
        }

        const request = context.switchToHttp().getRequest();

        const user = request.user;

        if (!user || !user.user_id) {
            console.log('DEBUG: User ID not found in request.user');
            throw new ForbiddenException('User identification missing');
        }

        if(user.is_admin){
            return true;
        }

        const warehouseId = 
        Number(request.params?.warehouse_id) ||
        Number(request.body?.warehouse_id) ||
        Number(request.query?.warehouse_id);

        if(!warehouseId || isNaN(warehouseId)){
            throw new BadRequestException("A valid Warehouse ID is required.");
        }

        const userWarehouse = await this.prisma.userWarehouse.findFirst({
            where: {
                user_id : user.user_id,
                warehouse_id: warehouseId,
            }
        })

        if(!userWarehouse){
            throw new ForbiddenException("You are not assigned to this warehouse");
        }

        if(!requiredRoles.includes(userWarehouse.role)){

            throw new ForbiddenException(`This action requires one of these roles: [${requiredRoles.join(', ')}]. 
            Your role is: ${userWarehouse.role}.`,);
        }

        request.warehouseRole = userWarehouse.role;

        return true;
    }
}

