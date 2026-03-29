import { Injectable,BadRequestException,NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/prisma.service';
import { WarehouseItemTransactionDto } from './dto/warehouse-item-transaction.dto';
import { BulkWarehouseInputDto } from './dto/bulk-warehouse-input.dto';

@Injectable()
export class WarehouseItemService {

    constructor(private prisma: PrismaService) {}

    async inputItem(dto: WarehouseItemTransactionDto) {

        return this.prisma.$transaction(async (tx) => {

            const warehouse = await tx.warehouse.findUnique({
                where: {id: dto.warehouse_id}
            })

            if(!warehouse){
                throw new NotFoundException('Warehouse not found');
            }

            const item = await tx.item.findUnique({
                where: {id: dto.item_id}
            })

            if(!item){
                throw new NotFoundException('Item not found');
            }

            const currentTotal = await tx.warehouseItem.aggregate({
                where: {warehouse_id: dto.warehouse_id},
                _sum: {quantity: true},
            });

            const currentQuantity = currentTotal._sum.quantity || 0;
            const afterInput = currentQuantity + dto.quantity; 

            if(afterInput > warehouse.capacity){   
                const remaining =  warehouse.capacity - currentQuantity;
                throw new BadRequestException(
                    `Warehouse capacity exceeded. ` +
                    `Capacity: ${warehouse.capacity}, ` +
                    `Current: ${currentQuantity}, ` +
                    `Requested: ${dto.quantity}, ` +
                    `Available space: ${remaining}.`,
                );
            }

            await tx.warehouseItem.upsert({
                where: {
                    warehouse_id_item_id:{
                        warehouse_id: dto.warehouse_id,
                        item_id: dto.item_id,
                    },
                },
                update: {
                    quantity: {increment: dto.quantity},
                },
                create: {
                    warehouse_id: dto.warehouse_id,
                    item_id: dto.item_id,
                    quantity: dto.quantity,
                }
            });

            return {
                message: `Added ${dto.quantity} units of "${item.item_name}" to warehouse #${dto.warehouse_id}.`,
                remaining_space: warehouse.capacity - afterInput,
            }  
        });


    }


    async outputItem(dto: WarehouseItemTransactionDto) {

        return this.prisma.$transaction(async (tx) => {

            const warehouseItem = await tx.warehouseItem.findUnique({
                where: {
                    warehouse_id_item_id:{
                        warehouse_id: dto.warehouse_id,
                        item_id: dto.item_id,
                    }
                }
            });

            if(!warehouseItem){
                throw new NotFoundException(
                    'this item does not exist in this warehouse'
                )
            }

            if(warehouseItem.quantity < dto.quantity){
                throw new BadRequestException(
                `Not enough quantity. ` +
                `Available: ${warehouseItem.quantity}, ` +
                `Requested: ${dto.quantity}.`,
                );
            }          

            await tx.warehouseItem.update({
                where: {
                    warehouse_id_item_id:{
                        warehouse_id: dto.warehouse_id,
                        item_id: dto.item_id,
                    }
                }, 
                data: {
                    quantity: {decrement: dto.quantity},
                }
            })    
            
            return {
                message: `Removed ${dto.quantity} units of item #${dto.item_id} from warehouse #${dto.warehouse_id}.`,
            }
        })
    }

    async bulkInput(dto: BulkWarehouseInputDto) {

        return this.prisma.$transaction(async (tx) => {

            const warehouse = await tx.warehouse.findUnique({
                where: {id: dto.warehouse_id}
            })
            
            if(!warehouse){
                throw new NotFoundException('Warehouse not found');
            }

            const currentTotal = await tx.warehouseItem.aggregate({
                where: {warehouse_id: dto.warehouse_id},
                _sum: {quantity: true},
            });

            const currentQuantity = currentTotal._sum.quantity ?? 0;

            const requestedTotal = dto.items.reduce((sum, i) => sum + i.quantity, 0);

            if(currentQuantity + requestedTotal > warehouse.capacity){
                const available = warehouse.capacity - currentQuantity;
                throw new BadRequestException(
                    `Capacity exceeded. Available: ${available}, Requested: ${requestedTotal}.`
                ); 
            }
                
            const itemIds = dto.items.map(i => i.item_id);

            const foundItems = await tx.item.findMany({
                where: {id: {in: itemIds}},
                select: {id: true, item_name: true},
            });

            if(foundItems.length !== itemIds.length){
                const foundIds = foundItems.map(i => i.id);
                const missingIds = itemIds.filter(id => !foundIds.includes(id));
                throw new NotFoundException(
                    `Items not found: ${missingIds.join(', ')}`
                );
            }

            for(const entry of dto.items){
                await tx.warehouseItem.upsert({
                    where: {
                        warehouse_id_item_id:{
                            warehouse_id: dto.warehouse_id,
                            item_id: entry.item_id,
                        },
                    },
                    update: {
                        quantity: {increment: entry.quantity},
                    },
                    create: {
                        warehouse_id: dto.warehouse_id,
                        item_id: entry.item_id,
                        quantity: entry.quantity,
                    }
                });
            }

            const itemMap = new Map(foundItems.map((i) => [i.id, i.item_name]));

            return {
                message: `Successfully added ${dto.items.length} item(s) to warehouse #${dto.warehouse_id}.`,
                remaining_space: warehouse.capacity - currentQuantity - requestedTotal,
                items_added: dto.items.map((entry) => ({
                    item_id: entry.item_id,
                    item_name: itemMap.get(entry.item_id),
                    quantity_added: entry.quantity,
                })),
            };


        } 
     )}
}


