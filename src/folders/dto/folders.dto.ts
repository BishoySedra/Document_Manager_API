import { IsNotEmpty, IsOptional, IsString, MaxLength, MinLength } from "class-validator";
import { ApiProperty } from "@nestjs/swagger";

/**
 * Folder creation request data
 */
export class CreateFolderDto {
  @IsString()
  @IsNotEmpty()
  @MinLength(1)
  @MaxLength(100)
  @ApiProperty({ 
    description: 'Name of the folder (must be unique within parent directory)',
    example: 'Project Documents 2024',
    minLength: 1,
    maxLength: 100,
  })
  name: string;

  @IsString()
  @IsOptional()
  @ApiProperty({ 
    description: 'ID of the parent folder for hierarchical organization (null for root folders)',
    example: '550e8400-e29b-41d4-a716-446655440000',
    required: false,
    format: 'uuid',
    nullable: true,
  })
  parentFolderId?: string;
}

/**
 * Folder update request data
 */
export class UpdateFolderDto {
  @IsString()
  @IsOptional()
  @MinLength(1)
  @MaxLength(100)
  @ApiProperty({ 
    description: 'Updated name of the folder (must be unique within parent directory)',
    example: 'Updated Project Documents 2024',
    required: false,
    minLength: 1,
    maxLength: 100,
  })
  name?: string;

  @IsString()
  @IsOptional()
  @ApiProperty({ 
    description: 'Updated parent folder ID to reorganize folder hierarchy (null to move to root)',
    example: '550e8400-e29b-41d4-a716-446655440001',
    required: false,
    format: 'uuid',
    nullable: true,
  })
  parentFolderId?: string;
}