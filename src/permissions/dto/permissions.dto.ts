import { IsEnum, IsNotEmpty, IsString } from 'class-validator';
import { Permission } from "@prisma/client"

export class PermissionDto {
    @IsString()
    @IsNotEmpty()
    documentId: string;

    @IsString()
    @IsNotEmpty()
    userId: string;

    @IsNotEmpty()
    @IsEnum(Permission)
    permission: Permission;
}
