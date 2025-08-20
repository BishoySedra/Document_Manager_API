import { IsEnum, IsNotEmpty, IsString } from 'class-validator';
import { Permission } from "@prisma/client"
import { ApiProperty } from '@nestjs/swagger';

/**
 * Permission creation request data
 */
export class PermissionDto {
  @IsString()
  @IsNotEmpty()
  @ApiProperty({ 
    description: 'Document ID to grant permission for',
    example: '550e8400-e29b-41d4-a716-446655440000',
    format: 'uuid',
  })
  documentId: string;

  @IsString()
  @IsNotEmpty()
  @ApiProperty({ 
    description: 'User ID to grant permission to',
    example: '550e8400-e29b-41d4-a716-446655440001',
    format: 'uuid',
  })
  userId: string;

  @IsNotEmpty()
  @IsEnum(Permission)
  @ApiProperty({ 
    description: 'Permission level to grant to the user',
    enum: Permission, 
    example: Permission.VIEW,
    enumName: 'Permission',
  })
  permission: Permission;
}

/**
 * Permission update request data
 */
export class UpdatePermissionDto {
  @IsNotEmpty()
  @IsEnum(Permission)
  @ApiProperty({ 
    description: 'New permission level for the user',
    enum: Permission, 
    example: Permission.EDIT,
    enumName: 'Permission',
  })
  permission: Permission;
}
