import { Controller, Post, Body, Request, Req } from '@nestjs/common';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { Any } from 'typeorm';

@Controller('auth')
export class AuthController {

    constructor(private authservice: AuthService){}

    @Post('refresh')

    async refresh(@Body() body: {user_id: number, refresh_token: string}, @Request() req: any){

        return this.authservice.refreshTokens(body.user_id, body.refresh_token, req)
    }
    
    @Post('login')

    async login(@Body() LoginDto: LoginDto, @Request() req: any){

        return await this.authservice.login(LoginDto.email, LoginDto.password, req)
    }

    @Post('logout')

    async logout(@Body() body: {user_id: number}){

        return this.authservice.logout(body.user_id)
    }
}
