import { Injectable, Module } from '@nestjs/common';
import { CreateItemDto } from './dto/create-item.dto';
import { UpdateItemDto } from './dto/update-item.dto';
import { PrismaService } from 'src/prisma.service';



@Injectable()
export class ItemsService {

  constructor(private prisma: PrismaService) {}


  async create(createItemDto: CreateItemDto, user_id: number) {
    const itemData = createItemDto

     await this.prisma.item.create({
      data: {
        ...itemData,
        users:{
          create: {
            user_id: user_id,
          }
        }
      },
     
    })

    return {message: 'item created successfully'}
  }

  async findAll() {
    
    return await this.prisma.item.findMany({
      select: {
        id:true,
        item_name: true,
        item_quantity: true,
        item_price: true,
      }
    })
  }

  async findOne(id: number) {
    return await this.prisma.item.findUnique({
      where: {id},
    });
  }

  async update(id: number, updateItemDto: UpdateItemDto) {
      await this.prisma.item.update({
      where: {id},
      data: updateItemDto,
    })

    return {message: 'the item has been updated succssfully.'}
  }

  async remove(id: number) {
    await this.prisma.item.delete({
      where: {id},
    })

    return {message: "item has been deleted successfully."}
  }

  
}
