import { Controller, Post, Body, Request, Req } from '@nestjs/common';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { Any } from 'typeorm';

@Controller('auth')
export class AuthController {

    constructor(private authservice: AuthService){}

    @Post('refresh')

    async refresh(@Body() body: { refresh_token: string}, @Request() req: any){

        return this.authservice.refreshTokens(body.refresh_token, req)
    }
    
    @Post('login')

    async login(@Body() LoginDto: LoginDto, @Request() req: any){

        return await this.authservice.login(LoginDto.email, LoginDto.password, req)
    }

    @Post('logout')
    async logout(@Body() body: {refresh_token: string}){
        
        return this.authservice.logout(body.refresh_token)
    }
    
    @Post('logout-all')

    async logoutAllDevices(@Body() body: {user_id: number}){

        return this.authservice.logoutAllDevices(body.user_id)
    }
}
