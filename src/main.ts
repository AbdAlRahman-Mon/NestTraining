import { NestFactory,HttpAdapterHost } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
//import session from 'express-session'; // <--- Import
import { TransformInterceptor } from './transform/transform.interceptor'; 
import { PrismaClientExceptionFilter } from './prisma-client-exception/prisma-client-exception.filter';
//import { PrismaSessionStore } from '@quixo3/prisma-session-store';
import { PrismaService } from './prisma.service';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  //const prismaService = app.get(PrismaService)

  app.useGlobalPipes(new ValidationPipe({
    whitelist: true, // Automatically strip out any extra data the user sends that we didn't ask for
  }))

  //  app.use(
  //   session({
  //     store: new PrismaSessionStore(
  //       prismaService as any,
  //       {
  //         checkPeriod: 2*60*1000,
  //         dbRecordIdIsSessionId: true,
  //         dbRecordIdFunction: undefined,
  //       }
  //     ),
  //     secret: 'MY_SESSION_SECRET', // The key to sign the Session ID cookie
  //     resave: false,               // Don't save session if it wasn't modified
  //     saveUninitialized: false,    // Don't create session until something is stored
  //     cookie: {
  //       httpOnly: true,            // SECURITY: Prevents JS from reading the cookie
  //       secure: false,             // Set to 'true' if using HTTPS
  //       maxAge: 1000 * 60 * 60,    // Session lasts 1 hour
  //     },
  //   }), 
  // );

  app.useGlobalInterceptors(new TransformInterceptor());
  const {httpAdapter} = app.get(HttpAdapterHost);
  app.useGlobalFilters(new PrismaClientExceptionFilter(httpAdapter))
  
  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
