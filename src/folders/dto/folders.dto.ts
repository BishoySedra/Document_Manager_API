import { IsNotEmpty, IsOptional, IsString } from "class-validator";

export class CreateFolderDto {
    @IsString()
    @IsNotEmpty()
    name: string;

    @IsString()
    @IsOptional()
    parentFolderId?: string;
}

export class UpdateFolderDto {
    @IsString()
    @IsOptional()
    name?: string;

    @IsString()
    @IsOptional()
    parentFolderId?: string;
}