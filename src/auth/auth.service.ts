import { ForbiddenException, Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../prisma.service';
import * as bcrypt from 'bcrypt';
import { Request } from 'express';

@Injectable()
export class AuthService {

    constructor(
        private prisma: PrismaService,
        private jwtService: JwtService,
    ){}

    async getTokens(user_id: number, email: string, is_admin: boolean){

        const payload = {user_id: user_id, email, is_admin}
        
        const [at, rt] = await Promise.all([

            this.jwtService.signAsync(payload, {
            secret: process.env.JWT_ACCESS_SECRET,
            expiresIn: '15m',
            }),

            this.jwtService.signAsync(payload, {
            secret: process.env.JWT_REFRESH_SECRET,
            expiresIn: '7d',
            }),


        ]);

        return {access_token: at, refresh_token: rt}
        
    }


    /* If we want to short the Device name
    private getDeviceName(userAgent: string): string {

    if (userAgent.includes('Postman')) return 'Postman App';

    if (userAgent.includes('iPhone')) return 'iPhone';

    if (userAgent.includes('Android')) return 'Android Device';

    return 'Web Browser';

    }
    **/

    async login(email, password, req: Request){

        //first i should find the user with provided data 
        const user = await this.prisma.user.findUnique({where: {email} })

        if(!user || !(await bcrypt.compare(password, user.password))){

            throw new UnauthorizedException('User Name or passowrd Uncorrect');
        }
        
        const tokens = await this.getTokens(user.id, user.email, user.is_admin);

        const deviceName = req.headers['user-agent'] || 'Unknown Device';
        const ipAddress = req.ip;

        const hashedToken = await bcrypt.hash(tokens.refresh_token, 14);

        const existingSession  = await this.prisma.userSession.findFirst({
            where: {
                user_id: user.id,
                deviceName: deviceName,
                ipAddress: ipAddress,
            }
        });

        if(existingSession){
            await this.prisma.userSession.update({
                where: { id: existingSession.id },
                data: { hashedToken: hashedToken },
            });
        }else{
            await this.prisma.userSession.create({
                data: {
                    hashedToken: hashedToken,
                    user_id: user.id,
                    deviceName: req.headers['user-agent'] || 'Unknown Device',
                    ipAddress: req.ip,
                },
            });
        }

        
        (req as any).session.user_id = user.id;
        (req as any).session.accessToken = tokens.access_token;
        (req as any).session.is_admin  = user.is_admin;

        return new Promise((resolve, reject) => {
            req.session.save((err) => {
                if(err) reject(err);
                resolve({message: 'User Logged in successfully', ...tokens})
            })
        })
        

    }

    async refreshTokens(user_id: number, refresh_token: string, req: Request){

        const decoded =  await this.jwtService.verifyAsync(refresh_token, {
            secret: process.env.JWT_REFRESH_SECRET, 
        });

        const userSessions = await this.prisma.userSession.findMany({
            where: {user_id: decoded.user_id},
        })

        let currentSession: any | null = null; 
        for (const session of userSessions){
            const isMatch = await bcrypt.compare(refresh_token, session.hashedToken)
            if(isMatch){
                currentSession = session;
                break;
            }
        }

        if(!currentSession){
            throw new ForbiddenException('Invalid Refresh Token');
        }

        const user = await this.prisma.user.findUnique({where: {id: decoded.user_id}});

        if (!user) {
        throw new ForbiddenException('User not found');
        }

        const tokens = await this.getTokens(user.id, user.email, user.is_admin);

        const newHash = await bcrypt.hash(tokens.refresh_token, 14);
        
        await this.prisma.userSession.update({
            where: {id: currentSession.id},
            data: {hashedToken: newHash}
        });

        (req as any).session.user_id = user.id;
        (req as any).session.is_admin = user.is_admin;
        (req as any).session.accessToken = tokens.access_token;

        return new Promise((resolve, reject) => {
            req.session.save((err) => {
                if (err) reject(err);
                resolve({
                    message: 'Session refreshed successfully',
                    ...tokens
                });
            });
        });
    }


    async logout(user_id: number){
        
        await this.prisma.userSession.deleteMany({
        where: { user_id: user_id },
        });

        return {message: 'Logged out sucessfully from all devices'}
    }
}
