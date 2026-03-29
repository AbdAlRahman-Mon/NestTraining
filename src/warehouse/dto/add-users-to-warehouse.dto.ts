import { IsNumber, IsEnum, IsNotEmpty, IsOptional, IsArray, IsInt } from "class-validator";

export enum Role {
    MANAGER = 'MANAGER', //مسؤول عن كل شيء في المخزن
    WORKER = 'WORKER', //مسؤول عن الاخراجات
}

export class AddUsersToWarehouseDto {
    
    @IsNotEmpty()
    @IsNumber()
    user_id: number;

    @IsNotEmpty()
    @IsNumber()
    warehouse_id: number;


    @IsNotEmpty()
    @IsEnum(Role ,{message: "role must be either MANAGER or WORKER"})
    role: Role;

    @IsOptional()
    @IsArray()
    @IsInt({ each: true })
    permission_ids?: number[];
}