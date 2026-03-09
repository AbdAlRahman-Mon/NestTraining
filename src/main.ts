import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import session from 'express-session'; // <--- Import
import { TransformInterceptor } from './transform/transform.interceptor'; 

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.useGlobalPipes(new ValidationPipe({
    whitelist: true, // Automatically strip out any extra data the user sends that we didn't ask for
  }))

   app.use(
    session({
      secret: 'MY_SESSION_SECRET', // The key to sign the Session ID cookie
      resave: false,               // Don't save session if it wasn't modified
      saveUninitialized: false,    // Don't create session until something is stored
      cookie: {
        httpOnly: true,            // SECURITY: Prevents JS from reading the cookie
        secure: false,             // Set to 'true' if using HTTPS
        maxAge: 1000 * 60 * 60,    // Session lasts 1 hour
      },
    }), 
  );

  app.useGlobalInterceptors(new TransformInterceptor());
  
  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
