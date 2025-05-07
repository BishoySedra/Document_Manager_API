import { Controller, Post, Patch, Delete, Body, Param, UseGuards } from '@nestjs/common';
import { PermissionsService } from './permissions.service';
import { PermissionDto, UpdatePermissionDto } from './dto/permissions.dto';
import { JwtGuard } from 'src/auth/guard';
import { UserPermissions } from './decorator/user-permissions.decorator';
import { Permission } from '@prisma/client';
import { SettingDocumentPermissionGuard } from './guard/setting-document-permission.guard';
import {
    ApiTags,
    ApiOperation,
    ApiResponse,
    ApiBearerAuth,
    ApiBody,
    ApiParam,
    ApiUnauthorizedResponse,
    ApiForbiddenResponse,
    ApiNotFoundResponse,
    ApiConflictResponse
} from '@nestjs/swagger';

@ApiTags('Permissions')  // Groups all permission endpoints under 'Permissions' in Swagger UI
@ApiBearerAuth()  // Indicates all endpoints require Bearer token authentication
@UseGuards(JwtGuard)
@Controller('permissions')
export class PermissionsController {

    // Inject the PermissionsService here
    constructor(private readonly permissionsService: PermissionsService) { }

    // Endpoint to set permission
    @Post()
    @ApiOperation({ summary: 'Set document permission for a user' })
    @ApiResponse({ status: 201, description: 'Permission created successfully' })
    @ApiConflictResponse({ description: 'Permission already exists' })
    @ApiNotFoundResponse({ description: 'Document or User not found' })
    @ApiBody({ type: PermissionDto })
    async setAccessControl(@Body() accessControlDto: PermissionDto) {
        return this.permissionsService.setAccessControl(accessControlDto);
    }

    // Endpoint to update permission by ID
    @Patch(':id')
    @UserPermissions(Permission.EDIT)
    @UseGuards(SettingDocumentPermissionGuard)
    @ApiOperation({ summary: 'Update document permission' })
    @ApiResponse({ status: 200, description: 'Permission updated successfully' })
    @ApiNotFoundResponse({ description: 'Permission not found' })
    @ApiConflictResponse({ description: 'Permission already exists' })
    @ApiUnauthorizedResponse({ description: 'Unauthorized' })
    @ApiForbiddenResponse({ description: 'Insufficient permissions' })
    @ApiParam({ name: 'id', description: 'Permission ID to update', type: String })
    @ApiBody({ type: UpdatePermissionDto })
    async updatePermission(@Param('id') id: string, @Body() accessControlDto: UpdatePermissionDto) {
        return this.permissionsService.updatePermission(id, accessControlDto);
    }

    // Endpoint to delete permission by ID
    @Delete(':id')
    @UserPermissions(Permission.EDIT)
    @UseGuards(SettingDocumentPermissionGuard)
    @ApiOperation({ summary: 'Delete document permission' })
    @ApiResponse({ status: 200, description: 'Permission deleted successfully' })
    @ApiNotFoundResponse({ description: 'Permission not found' })
    @ApiUnauthorizedResponse({ description: 'Unauthorized' })
    @ApiForbiddenResponse({ description: 'Insufficient permissions' })
    @ApiParam({ name: 'id', description: 'Permission ID to delete', type: String })
    async deletePermission(@Param('id') id: string) {
        return this.permissionsService.deletePermission(id);
    }
}