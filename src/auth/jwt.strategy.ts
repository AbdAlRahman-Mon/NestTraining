import { Injectable } from "@nestjs/common";
import { PassportStrategy } from "@nestjs/passport";
import { ExtractJwt, Strategy, } from "passport-jwt";

interface JwtPayload{
    user_id: number,
    email: string,
    is_admin: boolean,
    is_used_at: number,
    expires_at: number,
}

@Injectable()

export class JwtStrategy extends PassportStrategy(Strategy){
    constructor(){
        super({
            jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
            ignoreExpiration: false,
            secretOrKey: 'testSecret@$52121'
        });
    }

    async validate(payload: JwtPayload) {
        return {user_id: payload.user_id, email: payload.email, is_admin: payload.is_admin}
    }
}