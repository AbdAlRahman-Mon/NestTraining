import { Injectable, CanActivate, ExecutionContext, UnauthorizedException } from '@nestjs/common';

@Injectable()

export class SessionGuard implements CanActivate{

    canActivate(context: ExecutionContext): boolean {

        const request = context.switchToHttp().getRequest();

        if(request.session && (request.session as any).user_id){

            request.user = {
                user_id: (request.session as any).user_id,
                is_admin: (request.session as any).is_admin,
            };

            return true
        }

        throw new UnauthorizedException('No active session found. Please login.');
    }
}