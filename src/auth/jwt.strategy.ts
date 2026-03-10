import { Injectable } from "@nestjs/common";
import { PassportStrategy } from "@nestjs/passport";
import { ExtractJwt, Strategy, } from "passport-jwt";
import { UnauthorizedException } from "@nestjs/common";
import { PrismaService } from "../prisma.service";

interface JwtPayload{
    user_id: number,
    email: string,
    is_admin: boolean,
    is_used_at: number,
    sid: string
    expires_at: number,
}

@Injectable()

export class JwtStrategy extends PassportStrategy(Strategy){
    constructor(private prisma: PrismaService){
        super({
            jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
            ignoreExpiration: false,
            secretOrKey: process.env.JWT_ACCESS_SECRET!,
        });
    }

    async validate(payload: JwtPayload) {

        const session = await this.prisma.userSession.findUnique({
        where: { sessionId: payload.sid },
        });

        if(!session){
            throw new UnauthorizedException('Invalid session. Please log in again.');
        }

        return {user_id: payload.user_id, email: payload.email, is_admin: payload.is_admin}
    }
}