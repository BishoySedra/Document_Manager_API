import { IsEmail, IsEnum, IsNotEmpty, IsOptional, IsString, MinLength } from "class-validator";
import { Role } from "@prisma/client"
import { ApiProperty } from "@nestjs/swagger";

/**
 * User registration request data
 */
export class RegisterDto {
  @IsString()
  @IsNotEmpty()
  @ApiProperty({ 
    description: 'User full name',
    example: 'John Doe',
    minLength: 2,
    maxLength: 100,
  })
  name: string;

  @IsEmail()
  @IsNotEmpty()
  @ApiProperty({ 
    description: 'User email address (must be unique)',
    example: 'john.doe@example.com',
    format: 'email',
  })
  email: string;

  @IsNotEmpty()
  @IsString()
  @MinLength(6)
  @ApiProperty({ 
    description: 'User password (minimum 6 characters)',
    example: 'securePassword123',
    minLength: 6,
    format: 'password',
  })
  password: string;

  @IsOptional()
  @IsEnum(Role)
  @ApiProperty({ 
    description: 'User role in the system (defaults to USER if not specified)',
    example: Role.USER, 
    enum: Role,
    default: Role.USER,
    required: false,
  })
  role?: Role;
}

/**
 * User login request data
 */
export class LoginDto {
  @IsEmail()
  @IsNotEmpty()
  @ApiProperty({ 
    description: 'User email address',
    example: 'john.doe@example.com',
    format: 'email',
  })
  email: string;

  @IsNotEmpty()
  @IsString()
  @ApiProperty({ 
    description: 'User password',
    example: 'securePassword123',
    format: 'password',
  })
  password: string;
}

/**
 * Password change request data
 */
export class ChangePasswordDto {
  @IsNotEmpty()
  @IsString()
  @ApiProperty({ 
    description: 'Current password for verification',
    example: 'currentPassword123',
    format: 'password',
  })
  oldPassword: string;

  @IsNotEmpty()
  @IsString()
  @MinLength(6)
  @ApiProperty({ 
    description: 'New password (minimum 6 characters)',
    example: 'newSecurePassword456',
    minLength: 6,
    format: 'password',
  })
  newPassword: string;
}

/**
 * JWT payload interface for internal use
 */
export interface AuthPayload {
  id: string;
  email: string;
}

