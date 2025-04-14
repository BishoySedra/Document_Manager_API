import { IsEmail, IsNotEmpty, IsString } from "class-validator";

export class RegisterDto {
    @IsString()
    @IsNotEmpty()
    name: string;

    @IsEmail()
    @IsNotEmpty()
    email: string;

    @IsNotEmpty()
    @IsString()
    password: string;
}

export class LoginDto {
    @IsEmail()
    @IsNotEmpty()
    email: string;

    @IsNotEmpty()
    @IsString()
    password: string;
}

export class ChangePasswordDto {
    @IsNotEmpty()
    @IsString()
    oldPassword: string;

    @IsNotEmpty()
    @IsString()
    newPassword: string;
}

export interface AuthPayload {
    id: string;
    email: string;
}

