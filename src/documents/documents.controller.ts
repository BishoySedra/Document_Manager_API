import { 
  Controller, 
  UseInterceptors, 
  Post, 
  Get, 
  Delete, 
  UploadedFile, 
  Body, 
  UseGuards, 
  Param, 
  Patch 
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { DocumentService } from './documents.service'
import * as DocumentsDto from './dto/documents.dto';
import { JwtGuard } from 'src/auth/guard';
import { User } from 'src/auth/decorator';
import { UserPermissions } from 'src/permissions/decorator/user-permissions.decorator';
import { Permission } from '@prisma/client';
import { DocumentPermissionGuard } from 'src/permissions/guard/document-permission.guard';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiConsumes,
  ApiBody,
  ApiParam,
  ApiUnauthorizedResponse,
  ApiForbiddenResponse,
  ApiCreatedResponse,
  ApiOkResponse,
  ApiNotFoundResponse,
  ApiBadRequestResponse,
  ApiInternalServerErrorResponse
} from '@nestjs/swagger';
import { 
  ApiResponseDto, 
  DocumentResponseDto, 
  PermissionResponseDto, 
  ErrorResponseDto 
} from '../common/dto/common-response.dto';

/**
 * Documents Controller
 * 
 * Handles document management operations including upload, retrieval, metadata management,
 * and permission handling. Supports file upload to Cloudinary and comprehensive document operations.
 */
@ApiTags('Documents')
@ApiBearerAuth('JWT-auth')
@UseGuards(JwtGuard)
@Controller('documents')
export class DocumentsController {
  constructor(private readonly documentService: DocumentService) {}

  /**
   * Upload a new document
   * 
   * Uploads a document file to the system with automatic metadata extraction and Cloudinary storage.
   */
  @Post('upload')
  @UseInterceptors(FileInterceptor('file'))
  @ApiOperation({ 
    summary: 'Upload a new document',
    description: `
      Upload a document file to the system with automatic processing and storage.
      
      **Supported File Types:**
      - PDF documents
      - Microsoft Word (DOC, DOCX)
      - Excel spreadsheets (XLS, XLSX)
      - PowerPoint presentations (PPT, PPTX)
      - CSV files
      - Text files (TXT)
      
      **Process:**
      1. File validation and type checking
      2. Upload to Cloudinary for secure storage
      3. Metadata extraction and database storage
      4. Automatic permission assignment to uploader
      
      **File Size Limits:** Please check system configuration for maximum file size.
    `,
  })
  @ApiCreatedResponse({ 
    description: 'Document uploaded successfully',
    type: ApiResponseDto<DocumentResponseDto>,
    example: {
      status: 201,
      message: 'Document uploaded successfully',
      body: {
        id: '550e8400-e29b-41d4-a716-446655440000',
        title: 'project-report.pdf',
        description: null,
        tags: [],
        filePath: '/documents/550e8400-e29b-41d4-a716-446655440000/project-report.pdf',
        fileType: 'PDF',
        fileSize: 1024000,
        uploadedById: '550e8400-e29b-41d4-a716-446655440000',
        folderId: null,
        createdAt: '2024-01-01T00:00:00.000Z',
        updatedAt: '2024-01-01T00:00:00.000Z'
      }
    }
  })
  @ApiBadRequestResponse({ 
    description: 'File validation failed or unsupported file type',
    type: ErrorResponseDto,
    example: {
      status: 400,
      message: 'Unsupported file type',
      body: 'Only PDF, DOCX, DOC, CSV, XLS, XLSX, PPT, PPTX, TXT files are allowed'
    }
  })
  @ApiInternalServerErrorResponse({ 
    description: 'Error uploading file to storage system',
    type: ErrorResponseDto
  })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    description: 'Document file to upload',
    schema: {
      type: 'object',
      properties: {
        file: {
          type: 'string',
          format: 'binary',
          description: 'Document file to upload (PDF, DOCX, DOC, CSV, XLS, XLSX, PPT, PPTX, TXT)',
        },
      },
      required: ['file'],
    },
  })
  uploadFile(@UploadedFile() file: Express.Multer.File, @User("id") userId: string) {
    return this.documentService.uploadFile(file, userId);
  }

  /**
   * Get document by ID
   * 
   * Retrieves document information and metadata by document ID with permission validation.
   */
  @Get(':id')
  @UserPermissions(Permission.VIEW)
  @UseGuards(DocumentPermissionGuard)
  @ApiOperation({ 
    summary: 'Get document information by ID',
    description: `
      Retrieve detailed document information including metadata, file information, and access details.
      
      **Permission Required:** VIEW
      
      **Returns:**
      - Document metadata (title, description, tags)
      - File information (type, size, path)
      - Upload information (uploader, date)
      - Folder association (if any)
    `,
  })
  @ApiOkResponse({ 
    description: 'Document information retrieved successfully',
    type: ApiResponseDto<DocumentResponseDto>,
    example: {
      status: 200,
      message: 'Document retrieved successfully',
      body: {
        id: '550e8400-e29b-41d4-a716-446655440000',
        title: 'Project Report 2024',
        description: 'Annual project report containing financial analysis',
        tags: ['REPORT', 'INVOICE'],
        filePath: '/documents/550e8400-e29b-41d4-a716-446655440000/report.pdf',
        fileType: 'PDF',
        fileSize: 1024000,
        uploadedById: '550e8400-e29b-41d4-a716-446655440000',
        folderId: '550e8400-e29b-41d4-a716-446655440001',
        createdAt: '2024-01-01T00:00:00.000Z',
        updatedAt: '2024-01-01T00:00:00.000Z'
      }
    }
  })
  @ApiNotFoundResponse({ 
    description: 'Document not found',
    type: ErrorResponseDto
  })
  @ApiUnauthorizedResponse({ 
    description: 'Authentication required',
    type: ErrorResponseDto
  })
  @ApiForbiddenResponse({ 
    description: 'Insufficient permissions to view document',
    type: ErrorResponseDto
  })
  @ApiParam({ 
    name: 'id', 
    description: 'Document unique identifier', 
    type: String,
    example: '550e8400-e29b-41d4-a716-446655440000'
  })
  getDocumentsById(@Param('id') id: string) {
    return this.documentService.getDocumentsById(id);
  }

  /**
   * Delete document by ID
   * 
   * Permanently removes a document from the system including file storage and all metadata.
   */
  @Delete(':id')
  @UserPermissions(Permission.EDIT)
  @UseGuards(DocumentPermissionGuard)
  @ApiOperation({ 
    summary: 'Delete document permanently',
    description: `
      Permanently delete a document from the system.
      
      **Permission Required:** EDIT
      
      **This action will:**
      - Remove the file from Cloudinary storage
      - Delete all document metadata from database
      - Remove all associated permissions
      - This operation is irreversible
      
      **Note:** Only users with EDIT permission can delete documents.
    `,
  })
  @ApiOkResponse({ 
    description: 'Document deleted successfully',
    type: ApiResponseDto,
    example: {
      status: 200,
      message: 'Document deleted successfully',
      body: null
    }
  })
  @ApiNotFoundResponse({ 
    description: 'Document not found',
    type: ErrorResponseDto
  })
  @ApiUnauthorizedResponse({ 
    description: 'Authentication required',
    type: ErrorResponseDto
  })
  @ApiForbiddenResponse({ 
    description: 'Insufficient permissions to delete document',
    type: ErrorResponseDto
  })
  @ApiParam({ 
    name: 'id', 
    description: 'Document ID to delete', 
    type: String,
    example: '550e8400-e29b-41d4-a716-446655440000'
  })
  deleteDocument(@Param('id') id: string) {
    return this.documentService.deleteDocument(id);
  }

  /**
   * Update document metadata
   * 
   * Updates document metadata including title, description, tags, and folder assignment.
   */
  @Patch(":id/metadata")
  @UserPermissions(Permission.EDIT)
  @UseGuards(DocumentPermissionGuard)
  @ApiOperation({ 
    summary: 'Update document metadata',
    description: `
      Update document metadata including title, description, tags, and folder organization.
      
      **Permission Required:** EDIT
      
      **Updatable Fields:**
      - Title: Document display name
      - Description: Detailed document description
      - Tags: Categorization tags for better organization
      - Folder ID: Move document to a different folder
      - File Type: Update file type classification
      
      **Note:** This endpoint updates metadata only, not the actual file content.
    `,
  })
  @ApiOkResponse({ 
    description: 'Document metadata updated successfully',
    type: ApiResponseDto<DocumentResponseDto>,
    example: {
      status: 200,
      message: 'Document metadata updated successfully',
      body: {
        id: '550e8400-e29b-41d4-a716-446655440000',
        title: 'Updated Project Report 2024',
        description: 'Updated annual project report with latest financial analysis',
        tags: ['REPORT', 'INVOICE', 'DESIGN'],
        filePath: '/documents/550e8400-e29b-41d4-a716-446655440000/report.pdf',
        fileType: 'PDF',
        fileSize: 1024000,
        uploadedById: '550e8400-e29b-41d4-a716-446655440000',
        folderId: '550e8400-e29b-41d4-a716-446655440002',
        createdAt: '2024-01-01T00:00:00.000Z',
        updatedAt: '2024-01-01T12:00:00.000Z'
      }
    }
  })
  @ApiNotFoundResponse({ 
    description: 'Document or specified folder not found',
    type: ErrorResponseDto
  })
  @ApiUnauthorizedResponse({ 
    description: 'Authentication required',
    type: ErrorResponseDto
  })
  @ApiForbiddenResponse({ 
    description: 'Insufficient permissions to edit document',
    type: ErrorResponseDto
  })
  @ApiParam({ 
    name: 'id', 
    description: 'Document ID to update', 
    type: String,
    example: '550e8400-e29b-41d4-a716-446655440000'
  })
  @ApiBody({ type: DocumentsDto.MetaDataDto })
  addMetaData(
    @Param('id') id: string, 
    @Body() metaData: DocumentsDto.MetaDataDto, 
    @User('id') createdById: string
  ) {
    return this.documentService.updateMetaData(id, metaData, createdById);
  }

  /**
   * Get document permissions
   * 
   * Retrieves all permissions associated with a specific document.
   */
  @Get(":id/permissions")
  @UserPermissions(Permission.VIEW)
  @UseGuards(DocumentPermissionGuard)
  @ApiOperation({ 
    summary: 'Get document access permissions',
    description: `
      Retrieve all access permissions for a specific document.
      
      **Permission Required:** VIEW
      
      **Returns:**
      - List of all users with access to the document
      - Permission levels for each user (VIEW, EDIT, DOWNLOAD)
      - Permission creation and update timestamps
      
      **Use Case:** 
      - Document owners checking who has access
      - Admins auditing document permissions
      - Users checking their own permission level
    `,
  })
  @ApiOkResponse({ 
    description: 'Document permissions retrieved successfully',
    type: ApiResponseDto<PermissionResponseDto[]>,
    example: {
      status: 200,
      message: 'Document permissions retrieved successfully',
      body: [
        {
          id: '550e8400-e29b-41d4-a716-446655440000',
          documentId: '550e8400-e29b-41d4-a716-446655440000',
          userId: '550e8400-e29b-41d4-a716-446655440001',
          permission: 'VIEW',
          createdAt: '2024-01-01T00:00:00.000Z',
          updatedAt: '2024-01-01T00:00:00.000Z'
        },
        {
          id: '550e8400-e29b-41d4-a716-446655440002',
          documentId: '550e8400-e29b-41d4-a716-446655440000',
          userId: '550e8400-e29b-41d4-a716-446655440003',
          permission: 'EDIT',
          createdAt: '2024-01-01T00:00:00.000Z',
          updatedAt: '2024-01-01T00:00:00.000Z'
        }
      ]
    }
  })
  @ApiNotFoundResponse({ 
    description: 'Document not found',
    type: ErrorResponseDto
  })
  @ApiUnauthorizedResponse({ 
    description: 'Authentication required',
    type: ErrorResponseDto
  })
  @ApiForbiddenResponse({ 
    description: 'Insufficient permissions to view document permissions',
    type: ErrorResponseDto
  })
  @ApiParam({ 
    name: 'id', 
    description: 'Document ID to get permissions for', 
    type: String,
    example: '550e8400-e29b-41d4-a716-446655440000'
  })
  getDocumentPermissions(@Param('id') id: string) {
    return this.documentService.getDocumentPermissions(id);
  }
}