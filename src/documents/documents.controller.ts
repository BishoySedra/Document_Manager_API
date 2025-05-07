import { Controller, UseInterceptors, Post, Get, Delete, UploadedFile, Body, ParseFilePipeBuilder, HttpStatus, UseGuards, Param, Patch } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { DocumentService } from './documents.service'
import * as DocumentsDto from './dto/documents.dto';
import { JwtGuard } from 'src/auth/guard';
import { User } from 'src/auth/decorator';
import { UserPermissions } from 'src/permissions/decorator/user-permissions.decorator';
import { Permission } from '@prisma/client';
import { DocumentPermissionGuard } from 'src/permissions/guard/document-permission.guard';
import { ApiBearerAuth, ApiOperation, ApiResponse } from '@nestjs/swagger';


@UseGuards(JwtGuard)
@ApiBearerAuth()
@Controller('documents')
export class DocumentsController {

    // injecting the service of documents
    constructor(private readonly documentService: DocumentService) { }

    // endpoint to upload file
    @Post('upload')
    @UseInterceptors(FileInterceptor('file'))
    @ApiOperation({ summary: 'Upload a file' })
    @ApiResponse({ status: HttpStatus.OK, description: 'File uploaded successfully' })
    @ApiResponse({ status: HttpStatus.BAD_REQUEST, description: 'Invalid or missing file!' })
    @ApiResponse({ status: HttpStatus.UNAUTHORIZED, description: 'Unauthorized' })
    @ApiResponse({ status: HttpStatus.FORBIDDEN, description: 'Forbidden' })
    @ApiResponse({ status: HttpStatus.INTERNAL_SERVER_ERROR, description: 'Internal server error' })
    uploadFile(@UploadedFile() file: Express.Multer.File, @User("id") userId: string) {
        return this.documentService.uploadFile(file, userId);
    }

    // endpoint to get documents by id
    @Get(':id')
    @UserPermissions(Permission.VIEW)
    @UseGuards(DocumentPermissionGuard)
    @ApiOperation({ summary: 'Get document by ID' })
    @ApiResponse({ status: HttpStatus.OK, description: 'Document retrieved successfully' })
    @ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'Document not found' })
    @ApiResponse({ status: HttpStatus.UNAUTHORIZED, description: 'Unauthorized' })
    @ApiResponse({ status: HttpStatus.FORBIDDEN, description: 'Forbidden' })
    @ApiResponse({ status: HttpStatus.INTERNAL_SERVER_ERROR, description: 'Internal server error' })
    getDocumentsById(@Param('id') id: string) {
        return this.documentService.getDocumentsById(id);
    }

    // endpoint to delete document by id
    @Delete(':id')
    @UserPermissions(Permission.EDIT)
    @UseGuards(DocumentPermissionGuard)
    @ApiOperation({ summary: 'Delete document by ID' })
    @ApiResponse({ status: HttpStatus.OK, description: 'Document deleted successfully' })
    @ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'Document not found' })
    @ApiResponse({ status: HttpStatus.UNAUTHORIZED, description: 'Unauthorized' })
    @ApiResponse({ status: HttpStatus.FORBIDDEN, description: 'Forbidden' })
    @ApiResponse({ status: HttpStatus.INTERNAL_SERVER_ERROR, description: 'Internal server error' })
    deleteDocument(@Param('id') id: string) {
        return this.documentService.deleteDocument(id);
    }

    // endpoint to update metadata of document
    @Patch(":id/metadata")
    @UserPermissions(Permission.EDIT)
    @UseGuards(DocumentPermissionGuard)
    @ApiOperation({ summary: 'Update document metadata' })
    @ApiResponse({ status: HttpStatus.OK, description: 'Document metadata updated successfully' })
    @ApiResponse({ status: HttpStatus.BAD_REQUEST, description: 'Invalid metadata' })
    @ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'Document not found' })
    @ApiResponse({ status: HttpStatus.UNAUTHORIZED, description: 'Unauthorized' })
    @ApiResponse({ status: HttpStatus.FORBIDDEN, description: 'Forbidden' })
    @ApiResponse({ status: HttpStatus.INTERNAL_SERVER_ERROR, description: 'Internal server error' })
    addMetaData(@Param('id') id: string, @Body() metaData: DocumentsDto.MetaDataDto, @User('id') createdById: string) {
        return this.documentService.updateMetaData(id, metaData, createdById);
    }

    // endpoint to get permissions of document
    @Get(":id/permissions")
    @UserPermissions(Permission.VIEW)
    @UseGuards(DocumentPermissionGuard)
    @ApiOperation({ summary: 'Get document permissions' })
    @ApiResponse({ status: HttpStatus.OK, description: 'Document permissions retrieved successfully' })
    @ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'Document not found' })
    @ApiResponse({ status: HttpStatus.UNAUTHORIZED, description: 'Unauthorized' })
    @ApiResponse({ status: HttpStatus.FORBIDDEN, description: 'Forbidden' })
    @ApiResponse({ status: HttpStatus.INTERNAL_SERVER_ERROR, description: 'Internal server error' })
    getDocumentPermissions(@Param('id') id: string) {
        return this.documentService.getDocumentPermissions(id);
    }
}
