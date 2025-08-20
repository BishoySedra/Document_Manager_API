import { IsEmail, IsEnum, IsOptional, IsString, MaxLength, MinLength } from 'class-validator';
import { Role } from '@prisma/client';
import { ApiProperty } from '@nestjs/swagger';

/**
 * User profile update request data
 */
export class updateProfileDto {
  @IsString()
  @IsOptional()
  @MinLength(2)
  @MaxLength(100)
  @ApiProperty({ 
    description: 'User full name',
    required: false, 
    example: 'John Doe',
    minLength: 2,
    maxLength: 100,
  })
  name?: string;

  @IsEmail()
  @IsOptional()
  @ApiProperty({ 
    description: 'User email address (must be unique if provided)',
    required: false, 
    example: 'john.doe@example.com',
    format: 'email',
  })
  email?: string;

  @IsOptional()
  @IsEnum(Role)
  @ApiProperty({ 
    description: 'User role in the system (only admins can update this field)',
    required: false, 
    enum: Role,
    example: Role.USER,
    enumName: 'Role',
  })
  role?: Role;
}
