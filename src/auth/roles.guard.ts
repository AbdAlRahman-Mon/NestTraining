import { Injectable, CanActivate, ExecutionContext, ForbiddenException } from "@nestjs/common";

import { Reflector } from "@nestjs/core";

@Injectable()

export class RolesGuard implements CanActivate{

    constructor(private reflector: Reflector){}

    canActivate(context: ExecutionContext): boolean {

        const requiredRoles = this.reflector.getAllAndOverride<string []>('roles',[
            context.getHandler(),
            context.getClass(),
        ])

        console.log('--- Roles Guard Check ---');
        console.log('Required Roles for this route:', requiredRoles)

        if(!requiredRoles){
            return true
        }

        const {user} = context.switchToHttp().getRequest()
        console.log('User from Token:', user); // <--- CHECK THIS!

        if(requiredRoles.includes('admin') && !user.is_admin){
            throw new ForbiddenException("you don't have a premession to reach this resource.")
            console.log('Access Denied: User is not an admin');
        }
        console.log('Access Granted!');

        return true;
        
    }

}