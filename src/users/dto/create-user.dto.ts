import { IsEmail,MinLength,IsNotEmpty,IsString, } from "class-validator";


export class CreateUserDto {

    @IsEmail()
    @IsNotEmpty()
    email

    @MinLength(6, {message:'the passowrd must be 6 characters and more'})
    @IsNotEmpty()
    password

    @IsString()
    @IsNotEmpty()
    name


}
