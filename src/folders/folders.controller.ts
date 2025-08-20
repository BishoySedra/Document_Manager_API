import { 
  Controller, 
  Post, 
  Body, 
  UseGuards, 
  Get, 
  Param, 
  Patch, 
  Delete 
} from '@nestjs/common';
import { FoldersService } from './folders.service';
import * as FolderDto from './dto/folders.dto';
import { JwtGuard } from 'src/auth/guard';
import { User } from 'src/auth/decorator';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiBody,
  ApiParam,
  ApiUnauthorizedResponse,
  ApiNotFoundResponse,
  ApiBadRequestResponse,
  ApiCreatedResponse,
  ApiOkResponse
} from '@nestjs/swagger';
import { 
  ApiResponseDto, 
  FolderResponseDto, 
  DocumentResponseDto, 
  ErrorResponseDto 
} from '../common/dto/common-response.dto';

/**
 * Folders Controller
 * 
 * Manages folder operations including creation, retrieval, updates, deletion,
 * and hierarchical folder organization for document management.
 */
@ApiTags('Folders')
@ApiBearerAuth('JWT-auth')
@UseGuards(JwtGuard)
@Controller('folders')
export class FoldersController {
  constructor(private readonly foldersService: FoldersService) {}

  /**
   * Create a new folder
   * 
   * Creates a new folder for organizing documents with optional parent folder assignment.
   */
  @Post()
  @ApiOperation({ 
    summary: 'Create a new folder',
    description: `
      Create a new folder for document organization with optional hierarchical structure.
      
      **Features:**
      - Create root-level folders (no parent)
      - Create nested folders with parent-child relationships
      - Automatic ownership assignment to creator
      - Unique folder names within the same parent directory
      
      **Folder Hierarchy:**
      - Root folders have no parent (parentFolderId = null)
      - Nested folders reference their parent folder ID
      - Unlimited nesting depth supported
      
      **Naming Rules:**
      - Folder names must be unique within the same parent directory
      - Case-sensitive folder names
      - Maximum length: 100 characters
    `,
  })
  @ApiCreatedResponse({ 
    description: 'Folder created successfully',
    type: ApiResponseDto<FolderResponseDto>,
    example: {
      status: 201,
      message: 'Folder created successfully',
      body: {
        id: '550e8400-e29b-41d4-a716-446655440000',
        name: 'Project Documents',
        parentFolderId: null,
        createdById: '550e8400-e29b-41d4-a716-446655440001',
        createdAt: '2024-01-01T00:00:00.000Z',
        updatedAt: '2024-01-01T00:00:00.000Z'
      }
    }
  })
  @ApiBadRequestResponse({ 
    description: 'Folder validation failed or name already exists',
    type: ErrorResponseDto,
    example: {
      status: 400,
      message: 'Folder already exists with this name',
      body: null
    }
  })
  @ApiNotFoundResponse({ 
    description: 'Parent folder not found or user not found',
    type: ErrorResponseDto
  })
  @ApiUnauthorizedResponse({ 
    description: 'Authentication required',
    type: ErrorResponseDto
  })
  @ApiBody({ type: FolderDto.CreateFolderDto })
  createFolder(@Body() folderDto: FolderDto.CreateFolderDto, @User('id') userId: string) {
    return this.foldersService.createFolder(folderDto, userId);
  }

  /**
   * Get all folders for current user
   * 
   * Retrieves all folders created by the authenticated user with hierarchical structure.
   */
  @Get()
  @ApiOperation({ 
    summary: 'Get all folders for current user',
    description: `
      Retrieve all folders created by the currently authenticated user.
      
      **Returns:**
      - Complete list of user's folders
      - Hierarchical folder structure information
      - Folder metadata and creation details
      - Parent-child relationships
      
      **Folder Structure:**
      - Root folders (parentFolderId = null)
      - Nested folders with parent references
      - Creation and modification timestamps
      
      **Use Cases:**
      - Display folder tree in UI
      - Folder management operations
      - Document organization planning
    `,
  })
  @ApiOkResponse({ 
    description: 'Folders retrieved successfully',
    type: ApiResponseDto<FolderResponseDto[]>,
    example: {
      status: 200,
      message: 'Folders retrieved successfully',
      body: [
        {
          id: '550e8400-e29b-41d4-a716-446655440000',
          name: 'Project Documents',
          parentFolderId: null,
          createdById: '550e8400-e29b-41d4-a716-446655440001',
          createdAt: '2024-01-01T00:00:00.000Z',
          updatedAt: '2024-01-01T00:00:00.000Z'
        },
        {
          id: '550e8400-e29b-41d4-a716-446655440002',
          name: 'Reports',
          parentFolderId: '550e8400-e29b-41d4-a716-446655440000',
          createdById: '550e8400-e29b-41d4-a716-446655440001',
          createdAt: '2024-01-01T00:00:00.000Z',
          updatedAt: '2024-01-01T00:00:00.000Z'
        }
      ]
    }
  })
  @ApiNotFoundResponse({ 
    description: 'No folders found or user not found',
    type: ErrorResponseDto
  })
  @ApiUnauthorizedResponse({ 
    description: 'Authentication required',
    type: ErrorResponseDto
  })
  getAllFolders(@User('id') userId: string) {
    return this.foldersService.getAllFolders(userId);
  }

  /**
   * Get folder by ID
   * 
   * Retrieves specific folder information with ownership validation.
   */
  @Get(':id')
  @ApiOperation({ 
    summary: 'Get folder details by ID',
    description: `
      Retrieve detailed information about a specific folder by its ID.
      
      **Authorization:**
      - Users can only access folders they created
      - Admins can access any folder
      
      **Returns:**
      - Complete folder information
      - Parent folder reference (if applicable)
      - Creation and modification details
      - Ownership information
      
      **Use Cases:**
      - Folder detail views
      - Navigation breadcrumbs
      - Folder property editing preparation
    `,
  })
  @ApiOkResponse({ 
    description: 'Folder information retrieved successfully',
    type: ApiResponseDto<FolderResponseDto>,
    example: {
      status: 200,
      message: 'Folder retrieved successfully',
      body: {
        id: '550e8400-e29b-41d4-a716-446655440000',
        name: 'Project Documents',
        parentFolderId: null,
        createdById: '550e8400-e29b-41d4-a716-446655440001',
        createdAt: '2024-01-01T00:00:00.000Z',
        updatedAt: '2024-01-01T00:00:00.000Z'
      }
    }
  })
  @ApiNotFoundResponse({ 
    description: 'Folder not found or unauthorized access',
    type: ErrorResponseDto
  })
  @ApiUnauthorizedResponse({ 
    description: 'Authentication required',
    type: ErrorResponseDto
  })
  @ApiParam({ 
    name: 'id', 
    description: 'Folder unique identifier', 
    type: String,
    example: '550e8400-e29b-41d4-a716-446655440000'
  })
  getFolderById(@User('id') userId: string, @Param('id') folderId: string) {
    return this.foldersService.getFolderById(userId, folderId);
  }

  /**
   * Update folder information
   * 
   * Updates folder properties including name and parent folder assignment with validation.
   */
  @Patch(':id')
  @ApiOperation({ 
    summary: 'Update folder properties',
    description: `
      Update folder information including name and hierarchical organization.
      
      **Updatable Properties:**
      - Folder name (must be unique within parent directory)
      - Parent folder ID (reorganize folder structure)
      
      **Validation Rules:**
      - New folder name must be unique within the target parent directory
      - Cannot move folder to be its own descendant (prevents circular references)
      - Parent folder must exist and be owned by the same user
      
      **Use Cases:**
      - Rename folders for better organization
      - Reorganize folder hierarchy
      - Move folders between parent directories
    `,
  })
  @ApiOkResponse({ 
    description: 'Folder updated successfully',
    type: ApiResponseDto<FolderResponseDto>,
    example: {
      status: 200,
      message: 'Folder updated successfully',
      body: {
        id: '550e8400-e29b-41d4-a716-446655440000',
        name: 'Updated Project Documents',
        parentFolderId: '550e8400-e29b-41d4-a716-446655440003',
        createdById: '550e8400-e29b-41d4-a716-446655440001',
        createdAt: '2024-01-01T00:00:00.000Z',
        updatedAt: '2024-01-01T12:00:00.000Z'
      }
    }
  })
  @ApiNotFoundResponse({ 
    description: 'Folder not found, unauthorized access, or parent folder not found',
    type: ErrorResponseDto
  })
  @ApiBadRequestResponse({ 
    description: 'Folder name already exists or invalid parent folder',
    type: ErrorResponseDto
  })
  @ApiUnauthorizedResponse({ 
    description: 'Authentication required',
    type: ErrorResponseDto
  })
  @ApiParam({ 
    name: 'id', 
    description: 'Folder ID to update', 
    type: String,
    example: '550e8400-e29b-41d4-a716-446655440000'
  })
  @ApiBody({ type: FolderDto.UpdateFolderDto })
  updateFolder(
    @User('id') userId: string, 
    @Param('id') folderId: string, 
    @Body() folderDto: FolderDto.UpdateFolderDto
  ) {
    return this.foldersService.updateFolder(userId, folderId, folderDto);
  }

  /**
   * Delete folder
   * 
   * Permanently removes a folder and all its contents including subfolders and documents.
   */
  @Delete(':id')
  @ApiOperation({ 
    summary: 'Delete folder and all contents',
    description: `
      Permanently delete a folder and all its contents from the system.
      
      **⚠️ WARNING: This action is irreversible!**
      
      **Deletion Process:**
      - Removes all documents within the folder
      - Deletes all subfolders recursively
      - Removes all associated permissions
      - Deletes files from storage system (Cloudinary)
      
      **Security:**
      - Only folder owners can delete their folders
      - Admins can delete any folder
      - Confirmation recommended in UI before deletion
      
      **Use Cases:**
      - Clean up unnecessary folder structures
      - Remove completed project folders
      - Administrative cleanup operations
    `,
  })
  @ApiOkResponse({ 
    description: 'Folder and all contents deleted successfully',
    type: ApiResponseDto,
    example: {
      status: 200,
      message: 'Folder deleted successfully',
      body: null
    }
  })
  @ApiNotFoundResponse({ 
    description: 'Folder not found or unauthorized access',
    type: ErrorResponseDto
  })
  @ApiUnauthorizedResponse({ 
    description: 'Authentication required',
    type: ErrorResponseDto
  })
  @ApiParam({ 
    name: 'id', 
    description: 'Folder ID to delete', 
    type: String,
    example: '550e8400-e29b-41d4-a716-446655440000'
  })
  deleteFolder(@User('id') userId: string, @Param('id') folderId: string) {
    return this.foldersService.deleteFolder(userId, folderId);
  }

  /**
   * Get folder contents
   * 
   * Retrieves all documents stored within a specific folder.
   */
  @Get(':id/documents')
  @ApiOperation({ 
    summary: 'Get documents within a folder',
    description: `
      Retrieve all documents stored within a specific folder.
      
      **Returns:**
      - Complete list of documents in the folder
      - Document metadata and file information
      - Access permission details for each document
      - Document organization information
      
      **Authorization:**
      - Users can access documents in their own folders
      - Shared documents based on individual permissions
      - Admins can access all folder contents
      
      **Use Cases:**
      - Display folder contents in file browser
      - Document listing and management
      - Folder-based document operations
    `,
  })
  @ApiOkResponse({ 
    description: 'Folder contents retrieved successfully',
    type: ApiResponseDto<DocumentResponseDto[]>,
    example: {
      status: 200,
      message: 'Folder contents retrieved successfully',
      body: [
        {
          id: '550e8400-e29b-41d4-a716-446655440000',
          title: 'Project Report 2024',
          description: 'Annual project report',
          tags: ['REPORT'],
          filePath: '/documents/550e8400-e29b-41d4-a716-446655440000/report.pdf',
          fileType: 'PDF',
          fileSize: 1024000,
          uploadedById: '550e8400-e29b-41d4-a716-446655440001',
          folderId: '550e8400-e29b-41d4-a716-446655440002',
          createdAt: '2024-01-01T00:00:00.000Z',
          updatedAt: '2024-01-01T00:00:00.000Z'
        }
      ]
    }
  })
  @ApiNotFoundResponse({ 
    description: 'Folder not found or unauthorized access',
    type: ErrorResponseDto
  })
  @ApiUnauthorizedResponse({ 
    description: 'Authentication required',
    type: ErrorResponseDto
  })
  @ApiParam({ 
    name: 'id', 
    description: 'Folder ID to get contents from', 
    type: String,
    example: '550e8400-e29b-41d4-a716-446655440000'
  })
  getFolderContents(@User('id') userId: string, @Param('id') folderId: string) {
    return this.foldersService.getFolderContents(userId, folderId);
  }
}