import { IsString, IsNotEmpty, IsOptional, IsEnum } from "class-validator";
import { FileType } from "@prisma/client";
import { ApiProperty } from "@nestjs/swagger";


export enum Tag {
    INVOICE = 'INVOICE',
    REPORT = 'REPORT',
    CONTRACT = 'CONTRACT',
    DESIGN = 'DESIGN',
    MANUAL = 'MANUAL',
}


export class MetaDataDto {
    @IsString()
    @IsNotEmpty()
    @IsOptional()
    @ApiProperty({ description: 'Document ID', required: false, example: 'This is a document!' })
    description?: string;

    @IsOptional()
    @IsEnum(Tag, { each: true })
    @ApiProperty({ description: 'Document tags', required: false, enum: Tag, isArray: true })
    tags?: Tag[];

    @IsString()
    @IsOptional()
    @ApiProperty({ description: 'Document title', required: false, example: 'Document Title' })
    title?: string;

    @IsString()
    @IsOptional()
    @ApiProperty({ description: 'Document folder ID', required: false, example: 'Folder ID' })
    folderId?: string;

    @IsOptional()
    @IsEnum(FileType)
    @ApiProperty({ description: 'Document file type', required: false, enum: FileType })
    fileType?: FileType
}