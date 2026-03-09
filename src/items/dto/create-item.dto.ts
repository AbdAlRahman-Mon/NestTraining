import { IsString, IsNumber, IsNotEmpty, Min, IsInt, IsPositive,} from "class-validator";

export class CreateItemDto {

    @IsString()
    @IsNotEmpty()
    item_name

    @IsNumber()
    @IsNotEmpty()
    @Min(0, {message:"The pricee cannot be less than zero"})
    item_price

    @IsNumber()
    @IsNotEmpty()
    @Min(0, {message:"The quantity cannot be less than zero"})
    item_quantity


}
