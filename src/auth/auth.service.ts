import { ForbiddenException, Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../prisma.service';
import * as bcrypt from 'bcrypt';
import { Request } from 'express';
import {v4 as uuidv4} from 'uuid';

@Injectable()
export class AuthService {

    constructor(
        private prisma: PrismaService,
        private jwtService: JwtService,
    ){}

    async getTokens(user_id: number, email: string, is_admin: boolean, sessionId: string){

        const payload = {user_id: user_id, email, is_admin, sid: sessionId};
        
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

            throw new UnauthorizedException('email or passowrd Uncorrect');
        }
        
        const sesssionId = uuidv4();

        const tokens = await this.getTokens(user.id, user.email, user.is_admin, sesssionId);

        const deviceName = req.headers['user-agent'] || 'Unknown Device';
        const ipAddress = req.ip;

        const hashedToken = await bcrypt.hash(tokens.refresh_token, 12);

        // const existingSession  = await this.prisma.userSession.findFirst({
        //     where: {
        //         user_id: user.id,
        //         deviceName: deviceName,
        //         ipAddress: ipAddress,
        //     }
        // });

        // if(existingSession){
        //     await this.prisma.userSession.update({
        //         where: { id: existingSession.id },
        //         data: { hashedToken: hashedToken },
        //     });
        // }else{
        //     await this.prisma.userSession.create({
        //         data: {
        //             hashedToken: hashedToken,
        //             user_id: user.id,
        //             deviceName: req.headers['user-agent'] || 'Unknown Device',
        //             ipAddress: req.ip,
        //         },
        //     });
        // }
        await this.prisma.userSession.create({
            data: {
                hashedToken: hashedToken,
                user_id: user.id,
                deviceName: deviceName,
                ipAddress: ipAddress,
                sessionId: sesssionId,
            },
        });

        
        // (req as any).session.user_id = user.id;
        // (req as any).session.is_admin  = user.is_admin;

        // return new Promise((resolve, reject) => {
        //     req.session.save((err) => {
        //         if(err) reject(err);
        //         resolve({message: 'User Logged in successfully', ...tokens})
        //     })
        // })

        return {
            message: 'User Logged in successfully',
            ...tokens
            
        }
        

    }

    async refreshTokens( refresh_token: string, req: Request){

        try{const decoded =  await this.jwtService.verifyAsync(refresh_token, {
            secret: process.env.JWT_REFRESH_SECRET, 
        });

        const sessionId = decoded.sid;

        const session = await this.prisma.userSession.findUnique({
            where: {sessionId: sessionId},
        });

        if(!session){
            throw new ForbiddenException('Invalid Refresh Token or session expired');
        }

        // const userSessions = await this.prisma.userSession.findMany({
        //     where: {user_id: decoded.user_id},
        // })

        // let currentSession: any | null = null; 
        // for (const session of userSessions){
        //     const isMatch = await bcrypt.compare(refresh_token, session.hashedToken)
        //     if(isMatch){
        //         currentSession = session;
        //         break;
        //     }
        // }

        // if(!currentSession){
        //     throw new ForbiddenException('Invalid Refresh Token');
        // }


        const isMatch = await bcrypt.compare(refresh_token, session.hashedToken);  

        if(!isMatch){ 
            await this.prisma.userSession.deleteMany({  
                where: {user_id: decoded.user_id},
            }); 

            throw new ForbiddenException('Invalid Refresh Token');
        }

        const user = await this.prisma.user.findUnique({where: {id: decoded.user_id}});

        if (!user) {
        throw new ForbiddenException('User not found');
        }

        const newSesssionId = uuidv4();
        const tokens = await this.getTokens(user.id, user.email, user.is_admin, newSesssionId);


        const newHash = await bcrypt.hash(tokens.refresh_token, 12);
        
        await this.prisma.userSession.update({
            where: {sessionId: session.sessionId},
            data: {hashedToken: newHash, sessionId: newSesssionId},
        });
         

        // (req as any).session.user_id = user.id;
        // (req as any).session.is_admin = user.is_admin;
        //(req as any).session.accessToken = tokens.access_token;

        // return new Promise((resolve, reject) => {
        //     req.session.save((err) => {
        //         if (err) reject(err);
        //         resolve({
        //             message: 'Session refreshed successfully',
        //             ...tokens
        //         });
        //     });
        // });

        return {
            message: 'Session refreshed successfully',
            ...tokens
        }
        }   catch(e){
            throw new ForbiddenException('Invalid Refresh Token');
        }
    }


    
    async logout(refresh_token: string) {
        try {
            const decoded = await this.jwtService.verifyAsync(refresh_token, {
                secret: process.env.JWT_REFRESH_SECRET,
            });
            
            // Delete only the specific session
            await this.prisma.userSession.deleteMany({
                where: { 
                    sessionId: decoded.sid 
                },
            });

            return { message: 'Logged out successfully from this device' };
        } catch (e) {
            // If token is invalid, we can't decode it, but we can still clear the cookie client-side
            throw new ForbiddenException('Invalid token');
        }
    }
    async logoutAllDevices(user_id: number){
        
        await this.prisma.userSession.deleteMany({
        where: { user_id: user_id },
        });
    
        return {message: 'Logged out sucessfully from all devices'}
    }
}
