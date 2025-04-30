import { Controller, Post, Patch, Delete, Body, Param, UseGuards } from '@nestjs/common';
import { PermissionsService } from './permissions.service';
import { PermissionDto } from './dto/permissions.dto';
import { JwtGuard } from 'src/auth/guard';

@UseGuards(JwtGuard)
@Controller('permissions')
export class PermissionsController {

    // Inject the PermissionsService here
    constructor(private readonly permissionsService: PermissionsService) { }

    // Endpoint to set permission
    @Post()
    async setAccessControl(@Body() accessControlDto: PermissionDto) {
        return this.permissionsService.setAccessControl(accessControlDto);
    }

    // Endpoint to update permission by ID
    @Patch(':id')
    async updatePermission(@Param('id') id: string, @Body() accessControlDto: PermissionDto) {
        return this.permissionsService.updatePermission(id, accessControlDto);
    }

    // Endpoint to delete permission by ID
    @Delete(':id')
    async deletePermission(@Param('id') id: string) {
        return this.permissionsService.deletePermission(id);
    }

}
