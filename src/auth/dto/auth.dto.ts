import { IsEmail, IsEnum, IsNotEmpty, IsOptional, IsString } from "class-validator";
import { Role } from "@prisma/client"
import { ApiProperty } from "@nestjs/swagger";

export class RegisterDto {
    @IsString()
    @IsNotEmpty()
    @ApiProperty({ example: 'John Doe' })
    name: string;

    @IsEmail()
    @IsNotEmpty()
    @ApiProperty({ example: "JohnDoe@gmail.com" })
    email: string;

    @IsNotEmpty()
    @IsString()
    @ApiProperty({ example: "password" })
    password: string;

    @IsOptional()
    @IsEnum(Role)
    @ApiProperty({ example: Role.USER, enum: Role })
    role?: Role;
}

export class LoginDto {
    @IsEmail()
    @IsNotEmpty()
    @ApiProperty({ example: "JohnDoe@gmail.com" })
    email: string;

    @IsNotEmpty()
    @IsString()
    @ApiProperty({ example: "password" })
    password: string;
}

export class ChangePasswordDto {
    @IsNotEmpty()
    @IsString()
    @ApiProperty({ example: "password" })
    oldPassword: string;

    @IsNotEmpty()
    @IsString()
    @ApiProperty({ example: "password123" })
    newPassword: string;
}

export interface AuthPayload {
    id: string;
    email: string;
}

