import { Controller, Post, Param, Body, UseGuards, ParseIntPipe } from '@nestjs/common';
import { WarehouseItemService } from './warehouse-item.service';
import { WarehouseItemTransactionDto } from './dto/warehouse-item-transaction.dto';
import { AuthGuard } from '@nestjs/passport';
import { WarehouseRolesGuard } from 'src/common/guards/warehouse-roles.guard';
import { WarehouseRoles } from 'src/common/decorators/warehouse-roles.decorator';
import { BulkWarehouseInputDto } from './dto/bulk-warehouse-input.dto';
import { WarehousePermissions } from 'src/common/decorators/warehouse-permissions.decorator';
import { WarehousePermissionsGuard } from 'src/common/guards/warehouse-permissions.guard';

@Controller('warehouse-items')
@UseGuards(AuthGuard('jwt'))
export class WarehouseItemController {
    constructor(private warehouseItemService: WarehouseItemService) {}

    @Post('input')
    //@WarehouseRoles('MANAGER')
    //@UseGuards(WarehouseRolesGuard)
    @WarehousePermissions('ITEM_INPUT')      
    @UseGuards(WarehousePermissionsGuard)
    inputItem(
        @Body() dto: WarehouseItemTransactionDto
    ){
        return this.warehouseItemService.inputItem(dto);
    }

    @Post('output')
    // @WarehouseRoles('MANAGER', 'WORKER')
    // @UseGuards(WarehouseRolesGuard)
    @WarehousePermissions('ITEM_OUTPUT')
    @UseGuards(WarehousePermissionsGuard)

    outputItem(
        @Body() dto: WarehouseItemTransactionDto
    ){
        return this.warehouseItemService.outputItem(dto);
    }

    @Post('bulk-input')
    // @WarehouseRoles('MANAGER')
    // @UseGuards(WarehouseRolesGuard)
    @WarehousePermissions('ITEM_OUTPUT')
    @UseGuards(WarehousePermissionsGuard)
    bulkInput(
        @Body() dto: BulkWarehouseInputDto
    ){
        return this.warehouseItemService.bulkInput(dto);
    }
}   