import { Injectable } from '@nestjs/common';

@Injectable()
export class MathService {

    calculateSum(a: number, b: number): number{

        return a + b;
    }

    calculateProduct(a: number, b: number): number{

        return a * b;
    }

    calculateDivision(a: number, b: number): number | string{
        
        if(b === 0){

            return 'Error:cannot divide by zero';
        }

        return a / b
    }
}
