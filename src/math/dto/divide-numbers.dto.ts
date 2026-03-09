import {IsNumber, IsNotEmpty, NotEquals, isNumber, isNotEmpty} from 'class-validator';

export class divideNumbersDto{

    @IsNumber()
    @IsNotEmpty()
    a: number;

    @IsNotEmpty()
    @IsNumber()
    @NotEquals(0,{message: 'Cannot divide by zero'})
    b: number;
    
}