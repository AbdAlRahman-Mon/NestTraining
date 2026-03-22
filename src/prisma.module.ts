import { Global, Module } from '@nestjs/common';
import { PrismaService } from './prisma.service';

@Global() // optional but powerful
@Module({
  providers: [PrismaService],
  exports: [PrismaService],
})
export class PrismaModule {}