import { Injectable,BadRequestException,NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/prisma.service';
import { WarehouseItemTransactionDto } from './dto/warehouse-item-transaction.dto';

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
                return new NotFoundException('Item not found');
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
}
