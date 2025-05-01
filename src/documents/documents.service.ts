import { HttpStatus, Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { AppResponse } from '../common/utils/response.util';
import { CustomException } from 'src/common/exceptions/custom.exception';
import { CloudinaryService } from 'nestjs-cloudinary';
import { FileType } from '@prisma/client';
import * as DocumentsDto from './dto/documents.dto';
import { Permission } from '@prisma/client';

@Injectable()
export class DocumentService {

    constructor(
        private readonly prisma: PrismaService,
        private readonly cloudinaryService: CloudinaryService) { }

    // service method to upload file
    async uploadFile(file: Express.Multer.File, uploadedById: string) {

        if (!file) {
            throw new CustomException("File is required", HttpStatus.BAD_REQUEST);
        }

        const { originalname, mimetype, size } = file;

        const fileType: string = this.getFileType(mimetype);

        const title: string = originalname.split('.').slice(0, -1).join('.');

        const fileSize: number = size / 1024; // Convert to KB

        const filePath = await this.uploadToCloudinary(file);

        // create a new document in the database
        const document = await this.prisma.document.create({
            data: {
                title,
                fileType: fileType as FileType,
                fileSize,
                filePath,
                uploadedById,
            },
        });

        // create a new document permission for the user
        await this.prisma.documentPermission.create({
            data: {
                documentId: document.id,
                userId: uploadedById,
                permission: Permission.EDIT,
            },
        });

        // create a response object
        return AppResponse.format(HttpStatus.CREATED, "File uploaded successfully", document);
    }

    // helper to upload file to cloudinary
    async uploadToCloudinary(file: Express.Multer.File): Promise<string> {
        try {
            const { secure_url } = await this.cloudinaryService.uploadFile(file, {
                resource_type: "raw",
                folder: "documents",
                public_id: file.originalname,
            });

            return secure_url;
        } catch (error) {
            throw new CustomException("Error uploading file to Cloudinary", HttpStatus.INTERNAL_SERVER_ERROR, error);
        }
    }

    // helper to get file type from mimetype
    getFileType(mimetype: string): string {
        switch (mimetype) {
            case 'application/pdf':
                return 'PDF';
            case 'application/vnd.openxmlformats-officedocument.wordprocessingml.document':
                return 'DOCX';
            case 'application/msword':
                return 'DOC';
            case 'text/csv':
                return 'CSV';
            case 'application/vnd.ms-excel':
                return 'XLS';
            case 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet':
                return 'XLSX';
            case 'application/vnd.ms-powerpoint':
                return 'PPT';
            case 'application/vnd.openxmlformats-officedocument.presentationml.presentation':
                return 'PPTX';
            case 'text/plain':
                return 'TXT';
            default:
                throw new CustomException("Unsupported file type", HttpStatus.BAD_REQUEST);
        }
    }

    // service method to get document by id
    async getDocumentsById(id: string) {
        // find the document by id
        const document = await this.prisma.document.findUnique({
            where: {
                id,
            },
            include: {
                uploadedBy: {
                    select: {
                        id: true,
                        name: true,
                        email: true,
                    },
                },
            },
        });

        // check if the document exists
        if (!document) {
            throw new CustomException("Document not found", HttpStatus.NOT_FOUND);
        }

        // create a response object
        return AppResponse.format(HttpStatus.OK, "Document retrieved successfully", document);
    }

    // service method to delete document by id
    async deleteDocument(id: string) {
        // find the document by id
        const document = await this.prisma.document.findUnique({
            where: {
                id,
            },
        });

        // check if the document exists
        if (!document) {
            throw new CustomException("Document not found", HttpStatus.NOT_FOUND);
        }

        // delete the document from database
        await this.prisma.document.delete({
            where: {
                id,
            },
        });

        // create a response object
        return AppResponse.format(HttpStatus.OK, `Document with ID ${document.id} deleted successfully`, null);
    }

    // service method to add metadata to document
    async updateMetaData(id: string, metaData: DocumentsDto.MetaDataDto) {
        // find the document by id
        const document = await this.prisma.document.findUnique({
            where: {
                id,
            },
        });

        // check if the document exists
        if (!document) {
            throw new CustomException("Document not found", HttpStatus.NOT_FOUND);
        }

        // check if the folderId exists in the database
        if (metaData.folderId) {
            const folder = await this.prisma.folder.findUnique({
                where: {
                    id: metaData.folderId,
                },
            });

            if (!folder) {
                throw new CustomException("Folder not found", HttpStatus.NOT_FOUND);
            }
        }

        // update the document metadata
        const updatedDocument = await this.prisma.document.update({
            where: {
                id,
            },
            data: {
                ...metaData
            },
        });

        // create a response object
        return AppResponse.format(HttpStatus.OK, `Document with ID ${document.id} updated successfully`, updatedDocument);
    }

    // service method to get document permissions
    async getDocumentPermissions(id: string) {
        // find the document by id
        const document = await this.prisma.document.findUnique({
            where: {
                id,
            },
            include: {
                documentPermissions: {
                    include: {
                        user: {
                            select: {
                                id: true,
                                name: true,
                                email: true,
                            },
                        },
                    },
                    omit: {
                        id: true,
                        documentId: true,
                        userId: true,
                    }
                },
            },
        });

        // check if the document exists
        if (!document) {
            throw new CustomException("Document not found", HttpStatus.NOT_FOUND);
        }

        // create a response object
        return AppResponse.format(HttpStatus.OK, "Document permissions retrieved successfully", document.documentPermissions);
    }
}