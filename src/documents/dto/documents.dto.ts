import { IsString, IsNotEmpty, IsOptional, IsEnum } from "class-validator";
import { FileType } from "@prisma/client";

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
    description?: string;

    @IsOptional()
    @IsEnum(Tag, { each: true })
    tags?: Tag[];

    @IsString()
    @IsOptional()
    title?: string;

    @IsString()
    @IsOptional()
    folderId?: string;

    @IsOptional()
    @IsEnum(FileType)
    fileType?: FileType
}