import { IsString, IsNotEmpty, IsOptional } from "class-validator";

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
}