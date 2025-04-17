import { Controller, Post, Body, UseGuards, Get } from '@nestjs/common';
import { FoldersService } from './folders.service';
import * as FolderDto from './dto/folders.dto';
import { JwtGuard } from 'src/auth/guard';
import { User } from 'src/auth/decorator';

@UseGuards(JwtGuard)
@Controller('folders')
export class FoldersController {

    // injecting the folders service
    constructor(private readonly foldersService: FoldersService) { }

    // endpoint to create a folder
    @Post()
    createFolder(@Body() folderDto: FolderDto.CreateFolderDto, @User('id') userId: string) {
        // calling the createFolder method from the folders service
        return this.foldersService.createFolder(folderDto, userId);
    }

    // endpoint to get all folders
    @Get()
    getAllFolders(@User('id') userId: string) {
        return this.foldersService.getAllFolders(userId);
    }
}
