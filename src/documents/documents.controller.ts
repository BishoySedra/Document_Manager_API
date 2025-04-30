import { Controller, UseInterceptors, Post, Get, Delete, UploadedFile, Body, ParseFilePipeBuilder, HttpStatus, UseGuards, Param, Patch } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { DocumentService } from './documents.service'
import * as DocumentsDto from './dto/documents.dto';
import { JwtGuard } from 'src/auth/guard';
import { User } from 'src/auth/decorator';

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
    getDocumentsById(@Param('id') id: string, @User("id") userId: string) {
        return this.documentService.getDocumentsById(id, userId);
    }

    // endpoint to delete document by id
    @Delete(':id')
    deleteDocument(@Param('id') id: string, @User("id") userId: string) {
        return this.documentService.deleteDocument(id, userId);
    }

    // endpoint to update metadata of document
    @Patch(":id/metadata")
    addMetaData(@Param('id') id: string, @Body() metaData: DocumentsDto.MetaDataDto, @User("id") userId: string) {
        return this.documentService.updateMetaData(id, metaData, userId);
    }

    // endpoint to get permissions of document
    @Get(":id/permissions")
    getDocumentPermissions(@Param('id') id: string) {
        return this.documentService.getDocumentPermissions(id);
    }

}
