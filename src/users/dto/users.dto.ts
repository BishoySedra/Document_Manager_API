import { IsEmail, IsOptional, IsString } from 'class-validator';

export class updateProfileDto {
    @IsString()
    @IsOptional()
    name?: string;

    @IsEmail()
    @IsOptional()
    email?: string;

    @IsString()
    @IsOptional()
    role?: string;
}
