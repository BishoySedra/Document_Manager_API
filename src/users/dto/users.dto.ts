import { IsEmail, IsEnum, IsOptional, IsString } from 'class-validator';
import { Role } from '@prisma/client';
import { ApiProperty } from '@nestjs/swagger';

export class updateProfileDto {
  @IsString()
  @IsOptional()
  @ApiProperty({ description: 'Username', required: false, example: 'Bishoy' })
  name?: string;

  @IsEmail()
  @IsOptional()
  @ApiProperty({ description: "User email", required: false, example: "bishoysedraa0@gmail.com" })
  email?: string;

  @IsString()
  @IsOptional()
  @IsEnum(Role)
  @ApiProperty({ description: "User role", required: false, enum: Role })
  role?: Role;
}
