import { IsString, IsNotEmpty, IsOptional, IsEnum } from "class-validator";
import { FileType } from "@prisma/client";

export class MetaDataDto {
    @IsString()
    @IsNotEmpty()
    @IsOptional()
    description?: string;

    @IsString({ each: true })
    @IsOptional()
    tags?: string[];

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