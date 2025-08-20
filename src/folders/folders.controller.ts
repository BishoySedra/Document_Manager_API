import { Controller, Post, Body, UseGuards, Get, Param, Patch, Delete } from '@nestjs/common';
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
    ApiBadRequestResponse
} from '@nestjs/swagger';

@ApiTags('Folders')  // Groups all folder endpoints under 'Folders' in Swagger UI
@ApiBearerAuth('JWT-auth')  // Indicates all endpoints require Bearer token authentication
@UseGuards(JwtGuard)
@Controller('folders')
export class FoldersController {

    // injecting the folders service
    constructor(private readonly foldersService: FoldersService) { }

    // endpoint to create a folder
    @Post()
    @ApiOperation({ summary: 'Create a new folder' })
    @ApiResponse({ status: 201, description: 'Folder created successfully' })
    @ApiBadRequestResponse({ description: 'Folder already exists with this name' })
    @ApiNotFoundResponse({ description: 'User not found' })
    @ApiUnauthorizedResponse({ description: 'Unauthorized action' })
    @ApiBody({ type: FolderDto.CreateFolderDto })
    createFolder(@Body() folderDto: FolderDto.CreateFolderDto, @User('id') userId: string) {
        // calling the createFolder method from the folders service
        return this.foldersService.createFolder(folderDto, userId);
    }

    // endpoint to get all folders
    @Get()
    @ApiOperation({ summary: 'Get all folders for current user' })
    @ApiResponse({ status: 200, description: 'Folders retrieved successfully' })
    @ApiNotFoundResponse({ description: 'No folders found or User not found' })
    @ApiUnauthorizedResponse({ description: 'Unauthorized action' })
    getAllFolders(@User('id') userId: string) {
        return this.foldersService.getAllFolders(userId);
    }

    // endpoint to get a folder by id
    @Get(':id')
    @ApiOperation({ summary: 'Get folder by ID' })
    @ApiResponse({ status: 200, description: 'Folder retrieved successfully' })
    @ApiNotFoundResponse({ description: 'Folder not found or unauthorized access' })
    @ApiUnauthorizedResponse({ description: 'Unauthorized action' })
    @ApiParam({ name: 'id', description: 'Folder ID', type: String })
    getFolderById(@User('id') userId: string, @Param('id') folderId: string) {
        return this.foldersService.getFolderById(userId, folderId);
    }

    // endpoint to update a folder
    @Patch(':id')
    @ApiOperation({ summary: 'Update folder by ID' })
    @ApiResponse({ status: 200, description: 'Folder updated successfully' })
    @ApiNotFoundResponse({ description: 'Folder not found, unauthorized access, or parent folder not found' })
    @ApiBadRequestResponse({ description: 'Folder with this name already exists or invalid parent folder' })
    @ApiUnauthorizedResponse({ description: 'Unauthorized action' })
    @ApiParam({ name: 'id', description: 'Folder ID to update', type: String })
    @ApiBody({ type: FolderDto.UpdateFolderDto })
    updateFolder(@User('id') userId: string, @Param('id') folderId: string, @Body() folderDto: FolderDto.UpdateFolderDto) {
        return this.foldersService.updateFolder(userId, folderId, folderDto);
    }

    // endpoint to delete a folder
    @Delete(':id')
    @ApiOperation({ summary: 'Delete folder by ID' })
    @ApiResponse({ status: 200, description: 'Folder deleted successfully' })
    @ApiNotFoundResponse({ description: 'Folder not found or unauthorized access' })
    @ApiUnauthorizedResponse({ description: 'Unauthorized action' })
    @ApiParam({ name: 'id', description: 'Folder ID to delete', type: String })
    deleteFolder(@User('id') userId: string, @Param('id') folderId: string) {
        return this.foldersService.deleteFolder(userId, folderId);
    }

    // endpoint to get folder contents by folder id
    @Get(':id/documents')
    @ApiOperation({ summary: 'Get documents within a folder' })
    @ApiResponse({ status: 200, description: 'Folder contents retrieved successfully' })
    @ApiNotFoundResponse({ description: 'Folder not found or unauthorized access' })
    @ApiUnauthorizedResponse({ description: 'Unauthorized action' })
    @ApiParam({ name: 'id', description: 'Folder ID to get contents from', type: String })
    getFolderContents(@User('id') userId: string, @Param('id') folderId: string) {
        return this.foldersService.getFolderContents(userId, folderId);
    }
}