import { HttpStatus, Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import * as FolderDto from './dto/folders.dto';
import { CustomException } from 'src/common/exceptions/custom.exception';
import { AppResponse } from 'src/common/utils/response.util';

@Injectable()
export class FoldersService {

    // injecting the prisma service
    constructor(private readonly prisma: PrismaService) { }

    // method to create a folder
    async createFolder(folderDto: FolderDto.CreateFolderDto, createdById: string) {

        // checking if the folder already exists
        const folderExists = await this.prisma.folder.findFirst({
            where: {
                name: folderDto.name,
                createdById,
            },
        });

        if (folderExists) {
            throw new CustomException('Folder already exists please choose a different name', HttpStatus.BAD_REQUEST);
        }

        // checking if the user exists
        const userExists = await this.prisma.user.findUnique({
            where: {
                id: createdById,
            },
        });

        if (!userExists) {
            throw new CustomException('User not found', HttpStatus.NOT_FOUND);
        }

        // creating the folder
        const folder = await this.prisma.folder.create({
            data: {
                ...folderDto,
                createdById,
            },
        });

        // checking if the folder is created successfully
        if (!folder) {
            throw new CustomException('Folder not created', HttpStatus.INTERNAL_SERVER_ERROR);
        }

        // returning the folder
        return AppResponse.format(HttpStatus.CREATED, 'Folder created successfully', folder);

    }

    // method to get all folders
    async getAllFolders(createdById: string) {

        // checking if the user exists
        const userExists = await this.prisma.user.findUnique({
            where: {
                id: createdById,
            },
        });

        if (!userExists) {
            throw new CustomException('User not found', HttpStatus.NOT_FOUND);
        }

        // checking if the user has any folders
        const folders = await this.prisma.folder.findMany({
            where: {
                createdById,
            },
        });

        // checking if the user has any folders
        if (folders.length === 0) {
            throw new CustomException('No folders found', HttpStatus.NOT_FOUND);
        }

        // returning the folders
        return AppResponse.format(HttpStatus.OK, 'Folders found successfully', folders);
    }

    // method to get folder by id
    async getFolderById(createdById: string, id: string) {
        // checking if the folder exists
        const folder = await this.prisma.folder.findUnique({
            where: {
                id,
                createdById
            },
        });

        if (!folder) {
            throw new CustomException('Folder not found or you are not authorized to access this folder', HttpStatus.NOT_FOUND);
        }

        // returning the folder
        return AppResponse.format(HttpStatus.OK, 'Folder found successfully', folder);
    }

    // method to update folder
    async updateFolder(createdById: string, id: string, folderDto: FolderDto.UpdateFolderDto) {
        // checking if the folder exists
        let folder = await this.prisma.folder.findUnique({
            where: {
                id,
                createdById,
            },
        });

        if (!folder) {
            throw new CustomException('Folder not found or you are not authorized to update this folder', HttpStatus.NOT_FOUND);
        }

        // checking if there is a folder with the same name for this user
        folder = await this.prisma.folder.findUnique({
            where: {
                name_createdById: {
                    name: folderDto.name,
                    createdById,
                },
            }
        });

        if (folder) {
            throw new CustomException('Folder with this name already exists', HttpStatus.BAD_REQUEST);
        }


        // check if the parentFolderId exists and is not the same as the current folder id
        if (folderDto.parentFolderId && folderDto.parentFolderId === id) {
            throw new CustomException('Parent folder cannot be the same as the current folder', HttpStatus.BAD_REQUEST);
        }

        // check if the parentFolderId exists in the database
        if (folderDto.parentFolderId) {
            const parentFolder = await this.prisma.folder.findUnique({
                where: {
                    id: folderDto.parentFolderId,
                },
            });

            if (!parentFolder) {
                throw new CustomException('Parent folder not found', HttpStatus.NOT_FOUND);
            }
        }

        // updating the folder
        const updatedFolder = await this.prisma.folder.update({
            where: {
                id,
            },
            data: {
                ...folderDto,
            },
        });

        // checking if the folder is updated successfully
        if (!updatedFolder) {
            throw new CustomException('Folder not updated', HttpStatus.INTERNAL_SERVER_ERROR);
        }

        // returning the updated folder
        return AppResponse.format(HttpStatus.OK, 'Folder updated successfully', updatedFolder);
    }

    // method to delete folder
    async deleteFolder(createdById: string, id: string) {
        // checking if the folder exists
        const folder = await this.prisma.folder.findUnique({
            where: {
                id,
                createdById,
            },
        });

        if (!folder) {
            throw new CustomException('Folder not found or you are not authorized to delete this folder', HttpStatus.NOT_FOUND);
        }

        // deleting the folder
        const deletedFolder = await this.prisma.folder.delete({
            where: {
                id,
            },
        });

        // checking if the folder is deleted successfully
        if (!deletedFolder) {
            throw new CustomException('Folder not deleted', HttpStatus.INTERNAL_SERVER_ERROR);
        }

        // returning the deleted folder
        return AppResponse.format(HttpStatus.OK, 'Folder deleted successfully', deletedFolder);
    }

    // method to get folder contents
    async getFolderContents(createdById: string, id: string) {
        // checking if the folder exists
        const folder = await this.prisma.folder.findUnique({
            where: {
                id,
                createdById,
            },
            include: {
                documents: true,
            },
        });

        if (!folder) {
            throw new CustomException('Folder not found or you are not authorized to access this folder', HttpStatus.NOT_FOUND);
        }

        // returning the folder contents
        return AppResponse.format(HttpStatus.OK, 'Folder contents found successfully', folder.documents);
    }
}