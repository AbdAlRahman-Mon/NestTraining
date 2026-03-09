import { Controller, Get, Query, Param, Post, Body } from '@nestjs/common';
import { MathService } from './math.service';
import { divideNumbersDto } from './dto/divide-numbers.dto';

@Controller('math')
export class MathController {

constructor(readonly mathservice:MathService){}

@Get('ping')

ping(){

    return {message: "The math controller is working"};
}

@Get('add')

addNumbers(@Query('a') a:string, @Query('b') b:string){

    const num1 = Number(a);
    const num2 = Number(b);

    const sum = this.mathservice.calculateSum(num1, num2);

    return {
        action: 'addition',
        result: sum
    }
}

@Get('multiply/:a/:b')

multiplyNumber(@Param('a') a:string, @Param('b') b:string){

    const num1 = Number(a);
    const num2 = Number(b);

    const res = this.mathservice.calculateProduct(num1, num2);

    return {
        action: 'multiplication',
        result: res
    }
}

@Post('divide')

divideNumber(@Body() divideDto: divideNumbersDto){

    const result = this.mathservice.calculateDivision(divideDto.a, divideDto.b)

    return {
        action: 'division',
        result: result
    }
}

}
