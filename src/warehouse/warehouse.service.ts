import { Injectable } from '@nestjs/common';
import { CreateWarehouseDto } from './dto/create-warehouse.dto';
import { UpdateWarehouseDto } from './dto/update-warehouse.dto';
import { PrismaService } from 'src/prisma.service';
import { AddUsersToWarehouseDto } from './dto/add-users-to-warehouse.dto';

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

  async assignUsersToWarehouse(addUsersToWarehouseDto: AddUsersToWarehouseDto) {

    await this.prisma.userWarehouse.create({
      data: addUsersToWarehouseDto,
    })

    return {
      message: "User assigned to warehouse successfully."
    }
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
