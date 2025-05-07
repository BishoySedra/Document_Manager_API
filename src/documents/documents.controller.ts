import { Controller, UseInterceptors, Post, Get, Delete, UploadedFile, Body, ParseFilePipeBuilder, HttpStatus, UseGuards, Param, Patch } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { DocumentService } from './documents.service'
import * as DocumentsDto from './dto/documents.dto';
import { JwtGuard } from 'src/auth/guard';
import { User } from 'src/auth/decorator';
import { UserPermissions } from 'src/permissions/decorator/user-permissions.decorator';
import { Permission, Role } from '@prisma/client';
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
    ApiForbiddenResponse
} from '@nestjs/swagger';

@ApiTags('Documents')  // Groups all document endpoints under 'Documents' in Swagger UI
@ApiBearerAuth()  // Indicates all endpoints require Bearer token authentication
@UseGuards(JwtGuard)
@Controller('documents')
export class DocumentsController {

    // injecting the service of documents
    constructor(private readonly documentService: DocumentService) { }

    // endpoint to upload file
    @Post('upload')
    @UseInterceptors(FileInterceptor('file'))
    @ApiOperation({ summary: 'Upload a document' })
    @ApiResponse({ status: 201, description: 'File uploaded successfully' })
    @ApiResponse({ status: 400, description: 'File is required or Unsupported file type' })
    @ApiResponse({ status: 500, description: 'Error uploading file to Cloudinary' })
    @ApiConsumes('multipart/form-data')
    @ApiBody({
        description: 'Document file to upload',
        schema: {
            type: 'object',
            properties: {
                file: {
                    type: 'string',
                    format: 'binary',
                },
            },
        },
    })
    uploadFile(@UploadedFile() file: Express.Multer.File, @User("id") userId: string) {
        return this.documentService.uploadFile(file, userId);
    }

    // endpoint to get documents by id
    @Get(':id')
    @UserPermissions(Permission.VIEW)
    @UseGuards(DocumentPermissionGuard)
    @ApiOperation({ summary: 'Get document by ID' })
    @ApiResponse({ status: 200, description: 'Document retrieved successfully' })
    @ApiResponse({ status: 404, description: 'Document not found' })
    @ApiUnauthorizedResponse({ description: 'Unauthorized' })
    @ApiForbiddenResponse({ description: 'Insufficient permissions' })
    @ApiParam({ name: 'id', description: 'Document ID', type: String })
    getDocumentsById(@Param('id') id: string) {
        return this.documentService.getDocumentsById(id);
    }

    // endpoint to delete document by id
    @Delete(':id')
    @UserPermissions(Permission.EDIT)
    @UseGuards(DocumentPermissionGuard)
    @ApiOperation({ summary: 'Delete document by ID' })
    @ApiResponse({ status: 200, description: 'Document deleted successfully' })
    @ApiResponse({ status: 404, description: 'Document not found' })
    @ApiUnauthorizedResponse({ description: 'Unauthorized' })
    @ApiForbiddenResponse({ description: 'Insufficient permissions' })
    @ApiParam({ name: 'id', description: 'Document ID to delete', type: String })
    deleteDocument(@Param('id') id: string) {
        return this.documentService.deleteDocument(id);
    }

    // endpoint to update metadata of document
    @Patch(":id/metadata")
    @UserPermissions(Permission.EDIT)
    @UseGuards(DocumentPermissionGuard)
    @ApiOperation({ summary: 'Update document metadata' })
    @ApiResponse({ status: 200, description: 'Document metadata updated successfully' })
    @ApiResponse({ status: 404, description: 'Document or folder not found' })
    @ApiUnauthorizedResponse({ description: 'Unauthorized' })
    @ApiForbiddenResponse({ description: 'Insufficient permissions' })
    @ApiParam({ name: 'id', description: 'Document ID to update', type: String })
    @ApiBody({ type: DocumentsDto.MetaDataDto })
    addMetaData(@Param('id') id: string, @Body() metaData: DocumentsDto.MetaDataDto, @User('id') createdById: string) {
        return this.documentService.updateMetaData(id, metaData, createdById);
    }

    // endpoint to get permissions of document
    @Get(":id/permissions")
    @UserPermissions(Permission.VIEW)
    @UseGuards(DocumentPermissionGuard)
    @ApiOperation({ summary: 'Get document permissions' })
    @ApiResponse({ status: 200, description: 'Document permissions retrieved successfully' })
    @ApiResponse({ status: 404, description: 'Document not found' })
    @ApiUnauthorizedResponse({ description: 'Unauthorized' })
    @ApiForbiddenResponse({ description: 'Insufficient permissions' })
    @ApiParam({ name: 'id', description: 'Document ID to get permissions for', type: String })
    getDocumentPermissions(@Param('id') id: string) {
        return this.documentService.getDocumentPermissions(id);
    }
}