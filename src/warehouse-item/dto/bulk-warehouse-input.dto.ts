import { Type } from "class-transformer";

import { IsInt,IsPositive,IsArray, ArrayMinSize, ValidateNested } from "class-validator";

export class  BulkItemEntry {

    @IsInt()
    item_id: number;

    @IsInt()
    @IsPositive()
    quantity:    number;
}

export class BulkWarehouseInputDto {
    
    @IsInt()
    warehouse_id: number;

    @IsArray()
    @ArrayMinSize(1, {message: 'At least one item must be provided'})
    @ValidateNested({ each: true })
    @Type(() => BulkItemEntry)

    items: BulkItemEntry[];


}