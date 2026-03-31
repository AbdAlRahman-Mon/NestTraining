import { NestFactory,HttpAdapterHost } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { TransformInterceptor } from './transform/transform.interceptor'; 
import { PrismaClientExceptionFilter } from './prisma-client-exception/prisma-client-exception.filter';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

    app.enableCors({
    origin: '*',             // any origin for now — when you have a frontend,
                               // change this to: origin: 'http://localhost:5173'

    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],

    allowedHeaders: [        // headers your client is allowed to send
      'Content-Type',
      'Authorization',
    ],

    credentials: false,      // must be false when origin is '*'
                             // set to true once you lock origin to a specific URL
  });

  app.useGlobalPipes(new ValidationPipe({
    whitelist: true, // Automatically strip out any extra data the user sends that we didn't ask for
  }))

  app.useGlobalInterceptors(new TransformInterceptor());
  const {httpAdapter} = app.get(HttpAdapterHost);
  app.useGlobalFilters(new PrismaClientExceptionFilter(httpAdapter))
  
  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
