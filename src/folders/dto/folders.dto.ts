import { IsNotEmpty, IsOptional, IsString } from "class-validator";
import { ApiProperty } from "@nestjs/swagger";

export class CreateFolderDto {
    @IsString()
    @IsNotEmpty()
    @ApiProperty({ description: 'Name of the folder', example: 'My Documents' })
    name: string;

    @IsString()
    @IsOptional()
    @ApiProperty({ description: 'ID of the parent folder', example: '1234567890abcdef', required: false })
    parentFolderId?: string;
}

export class UpdateFolderDto {
    @IsString()
    @IsOptional()
    @ApiProperty({ description: 'Name of the folder', example: 'Updated Folder Name', required: false })
    name?: string;

    @IsString()
    @IsOptional()
    @ApiProperty({ description: 'ID of the parent folder', example: '1234567890abcdef', required: false })
    parentFolderId?: string;
}