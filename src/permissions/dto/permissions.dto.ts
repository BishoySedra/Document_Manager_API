import { IsEnum, IsNotEmpty, IsString } from 'class-validator';
import { Permission } from "@prisma/client"
import { ApiProperty } from '@nestjs/swagger';

export class PermissionDto {
    @IsString()
    @IsNotEmpty()
    @ApiProperty({ description: 'Document ID', example: '1234567890abcdef' })
    documentId: string;

    @IsString()
    @IsNotEmpty()
    @ApiProperty({ description: 'User ID', example: '1234567890abcdef' })
    userId: string;

    @IsNotEmpty()
    @IsEnum(Permission)
    @ApiProperty({ description: 'Permission type', enum: Permission, example: Permission.VIEW })
    permission: Permission;
}

export class UpdatePermissionDto {

    @IsNotEmpty()
    @IsEnum(Permission)
    @ApiProperty({ description: 'Permission type', enum: Permission, example: Permission.VIEW })
    permission: Permission;
}
