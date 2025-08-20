import { IsString, IsNotEmpty, IsOptional, IsEnum, IsArray } from "class-validator";
import { FileType } from "@prisma/client";
import { ApiProperty } from "@nestjs/swagger";

/**
 * Available document tags for categorization
 */
export enum Tag {
  INVOICE = 'INVOICE',
  REPORT = 'REPORT',
  CONTRACT = 'CONTRACT',
  DESIGN = 'DESIGN',
  MANUAL = 'MANUAL',
}

/**
 * Document metadata update request data
 */
export class MetaDataDto {
  @IsString()
  @IsOptional()
  @ApiProperty({ 
    description: 'Document description providing additional context and details',
    required: false, 
    example: 'Annual financial report containing revenue analysis and projections for Q4 2024',
    maxLength: 500,
  })
  description?: string;

  @IsOptional()
  @IsArray()
  @IsEnum(Tag, { each: true })
  @ApiProperty({ 
    description: 'Document categorization tags for better organization and searchability',
    required: false, 
    enum: Tag, 
    isArray: true,
    example: [Tag.REPORT, Tag.INVOICE],
    type: [String],
  })
  tags?: Tag[];

  @IsString()
  @IsOptional()
  @ApiProperty({ 
    description: 'Document title for display and identification',
    required: false, 
    example: 'Q4 2024 Financial Report',
    minLength: 1,
    maxLength: 200,
  })
  title?: string;

  @IsString()
  @IsOptional()
  @ApiProperty({ 
    description: 'Folder ID to organize the document within a specific folder structure',
    required: false, 
    example: '550e8400-e29b-41d4-a716-446655440000',
    format: 'uuid',
  })
  folderId?: string;

  @IsOptional()
  @IsEnum(FileType)
  @ApiProperty({ 
    description: 'Document file type classification for proper handling and display',
    required: false, 
    enum: FileType,
    example: FileType.PDF,
    enumName: 'FileType',
  })
  fileType?: FileType
}