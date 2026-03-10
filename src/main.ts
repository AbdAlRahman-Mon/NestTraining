import { NestFactory,HttpAdapterHost } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { TransformInterceptor } from './transform/transform.interceptor'; 
import { PrismaClientExceptionFilter } from './prisma-client-exception/prisma-client-exception.filter';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.useGlobalPipes(new ValidationPipe({
    whitelist: true, // Automatically strip out any extra data the user sends that we didn't ask for
  }))

  app.useGlobalInterceptors(new TransformInterceptor());
  const {httpAdapter} = app.get(HttpAdapterHost);
  app.useGlobalFilters(new PrismaClientExceptionFilter(httpAdapter))
  
  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
