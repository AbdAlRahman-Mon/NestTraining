import {IsNotEmpty, IsNumber, Min } from 'class-validator';

export class WarehouseItemTransactionDto {
    
    @IsNotEmpty()
    @IsNumber()
    item_id: number;

    @IsNotEmpty()
    @IsNumber()
    warehouse_id: number;

    @IsNotEmpty()
    @IsNumber()
    @Min(1, {message: 'Quantity must be at least 1'})
    quantity: number;
}