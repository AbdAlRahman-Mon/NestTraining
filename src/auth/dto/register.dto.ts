import { IsEmail,MinLength,IsNotEmpty,IsString, Matches } from "class-validator";


export class registerDto {

    @IsEmail()
    @IsNotEmpty()
    email

    @IsNotEmpty()
    @MinLength(6, {message:'the passowrd must be 6 characters and more'})
    @Matches(/(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])/, {message: 'the password must contain at least one uppercase letter, one lowercase letter and one number   '})
    password

    @IsNotEmpty()
    @IsString()
    @Matches(/^[a-zA-Z\s]*$/, {message: 'the name must contain only letters and spaces'})
    name
}
