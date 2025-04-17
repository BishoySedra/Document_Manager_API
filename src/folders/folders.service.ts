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

        // checking if the folder name is empty
        if (!folderDto.name) {
            throw new CustomException('Folder name is required', HttpStatus.BAD_REQUEST);
        }

        // checking if the folder already exists
        const folderExists = await this.prisma.folder.findFirst({
            where: {
                name: folderDto.name,
            },
        });

        // if the folder already exists, then make the name concatenated with the current date
        if (folderExists) {
            folderDto.name = `${folderDto.name}-${Date.now()}`;
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
}