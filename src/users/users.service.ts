import { Injectable } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { PrismaService } from 'src/prisma.service';
import * as bcrypt from 'bcrypt';

@Injectable()
export class UsersService {

  constructor(private prisma: PrismaService) {}

 async create(createUserDto: CreateUserDto) {
    const hashed_passowrd = await bcrypt.hash(createUserDto.password,10)
    
     await this.prisma.user.create({
     data: {
      ...createUserDto,
      password: hashed_passowrd,
     }
    })

    return {message: "user Register successfully."}
  }

  async findAll() {
    return await this.prisma.user.findMany({
      select:{ 
      id: true,
      name: true,
      email: true,
      } 
    });
  }

 async findOne(id: number) {
    return await this.prisma.user.findUnique({
      where: {id},
    });
  }

  async update(id: number, updateUserDto: UpdateUserDto) {

    if(updateUserDto.password){

      updateUserDto.password = await bcrypt.hash(updateUserDto.password,10);
    }

    const updated_user  =  await this.prisma.user.update({
      where: {id},
      data: updateUserDto,
    })

    return {message: `user ${updated_user.id} udpated his name from`}
  }

  async remove(id: number) {
    const deleted_user = await this.prisma.user.delete({
      where: {id},
    })
   
      return {message: `users with name ${deleted_user.name} was deleted successfully`}
    
  }

  async findAllUserItems(id: number){
   const UserWithItems =  await this.prisma.user.findUnique({
      where:{id},
      include:{
        items:{
          include:{
            item:{
              select:{
                item_name:true,
                item_price:true,
                item_quantity: true,
              }
            }
          }
        }
      }
    })

    if(!UserWithItems) return []

    return UserWithItems.items.map((pivotRow) => pivotRow.item);
  }

  
}
