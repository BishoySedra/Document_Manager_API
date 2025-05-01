import { Controller, UseInterceptors, Post, Get, Delete, UploadedFile, Body, ParseFilePipeBuilder, HttpStatus, UseGuards, Param, Patch } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { DocumentService } from './documents.service'
import * as DocumentsDto from './dto/documents.dto';
import { JwtGuard } from 'src/auth/guard';
import { User } from 'src/auth/decorator';
import { UserPermissions } from 'src/permissions/decorator/user-permissions.decorator';
import { Permission, Role } from '@prisma/client';
import { DocumentPermissionGuard } from 'src/permissions/guard/document-permission.guard';

@UseGuards(JwtGuard)
@Controller('documents')
export class DocumentsController {

    // injecting the service of documents
    constructor(private readonly documentService: DocumentService) { }

    // endpoint to upload file
    @Post('upload')
    @UseInterceptors(FileInterceptor('file'))
    uploadFile(@UploadedFile() file: Express.Multer.File, @User("id") userId: string) {
        return this.documentService.uploadFile(file, userId);
    }

    // endpoint to get documents by id
    @Get(':id')
    @UserPermissions(Permission.VIEW)
    @UseGuards(DocumentPermissionGuard)
    getDocumentsById(@Param('id') id: string) {
        return this.documentService.getDocumentsById(id);
    }

    // endpoint to delete document by id
    @Delete(':id')
    @UserPermissions(Permission.EDIT)
    @UseGuards(DocumentPermissionGuard)
    deleteDocument(@Param('id') id: string) {
        return this.documentService.deleteDocument(id);
    }

    // endpoint to update metadata of document
    @Patch(":id/metadata")
    @UserPermissions(Permission.EDIT)
    @UseGuards(DocumentPermissionGuard)
    addMetaData(@Param('id') id: string, @Body() metaData: DocumentsDto.MetaDataDto) {
        return this.documentService.updateMetaData(id, metaData);
    }

    // endpoint to get permissions of document
    @Get(":id/permissions")
    @UserPermissions(Permission.VIEW)
    @UseGuards(DocumentPermissionGuard)
    getDocumentPermissions(@Param('id') id: string) {
        return this.documentService.getDocumentPermissions(id);
    }
}
