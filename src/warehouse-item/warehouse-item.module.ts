import { Module } from '@nestjs/common';
import { WarehouseItemService } from './warehouse-item.service';
import { WarehouseItemController } from './warehouse-item.controller';
import { PrismaModule } from 'src/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [WarehouseItemController],
  providers: [WarehouseItemService],
})
export class WarehouseItemModule {}
