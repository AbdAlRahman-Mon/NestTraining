import { Controller, Post, Param, Body, UseGuards, ParseIntPipe } from '@nestjs/common';
import { WarehouseItemService } from './warehouse-item.service';
import { WarehouseItemTransactionDto } from './dto/warehouse-item-transaction.dto';
import { AuthGuard } from '@nestjs/passport';
import { WarehouseRolesGuard } from 'src/common/guards/warehouse-roles.guard';
import { WarehouseRoles } from 'src/common/decorators/warehouse-roles.decorator';

@Controller('warehouse-items')
@UseGuards(AuthGuard('jwt'))
export class WarehouseItemController {
    constructor(private warehouseItemService: WarehouseItemService) {}

    @Post('input')
    @WarehouseRoles('MANAGER')
    @UseGuards(WarehouseRolesGuard)
    inputItem(
        @Body() dto: WarehouseItemTransactionDto
    ){
        return this.warehouseItemService.inputItem(dto);
    }

    @Post('output')
    @WarehouseRoles('MANAGER', 'WORKER')
    @UseGuards(WarehouseRolesGuard)
    outputItem(
        @Body() dto: WarehouseItemTransactionDto
    ){
        return this.warehouseItemService.outputItem(dto);
    }
}   