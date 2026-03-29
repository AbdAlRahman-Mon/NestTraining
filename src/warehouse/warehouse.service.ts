import { Injectable } from '@nestjs/common';
import { CreateWarehouseDto } from './dto/create-warehouse.dto';
import { UpdateWarehouseDto } from './dto/update-warehouse.dto';
import { PrismaService } from 'src/prisma.service';
import { AddUsersToWarehouseDto } from './dto/add-users-to-warehouse.dto';
import { BadRequestException } from '@nestjs/common/exceptions';

@Injectable()
export class WarehouseService {
  constructor(private prisma: PrismaService) {}

  async create(createWarehouseDto: CreateWarehouseDto) {

    await this.prisma.warehouse.create({
      data: createWarehouseDto,
    })

    return {
      message: "Warehouse created successfully."
    }

  }

  async assignUsersToWarehouse(dto: AddUsersToWarehouseDto) {

    // await this.prisma.userWarehouse.create({
    //   data: addUsersToWarehouseDto,
    // })

    // return {
    //   message: "User assigned to warehouse successfully."
    // }

    return this.prisma.$transaction(async (tx) =>{

      await tx.userWarehouse.create({
        data:{
          user_id: dto.user_id,
          warehouse_id: dto.warehouse_id,
          role: dto.role,
        }
      })

      if(dto.permission_ids && dto.permission_ids.length > 0){

        const found = await tx.permission.findMany({
          where: {id: {in: dto.permission_ids}}
        })

        if(found.length !== dto.permission_ids.length){
          const foundIds = new Set(found.map((p) => p.id));
          const missing  = dto.permission_ids.filter((id) => !foundIds.has(id));
          throw new BadRequestException(`Permission IDs not found: [${missing.join(', ')}]`);
        }

        await tx.userWarehousePermission.createMany({
          data: dto.permission_ids.map((permission_id) => ({
            user_id: dto.user_id,
            warehouse_id: dto.warehouse_id,
            permission_id,
          }))
        })
        
      }
      
        return { message: 'User assigned to warehouse successfully.' };
    })
  }

  findAll() {
    return `This action returns all warehouse`;
  }

  findOne(id: number) {
    return `This action returns a #${id} warehouse`;
  }

  update(id: number, updateWarehouseDto: UpdateWarehouseDto) {
    return `This action updates a #${id} warehouse`;
  }

  remove(id: number) {
    return `This action removes a #${id} warehouse`;
  }
}
