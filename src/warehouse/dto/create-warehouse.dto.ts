import { IsNotEmpty, IsString, IsNumber } from "class-validator";

export class CreateWarehouseDto {
    
    @IsNotEmpty()
 
    @IsNotEmpty()
    @IsString()
    warehouse_name: string;

    @IsNotEmpty()
    @IsString()
    location: string;

    @IsNotEmpty()
    @IsNumber()
    capacity: number;
}

