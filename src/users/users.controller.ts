import { Controller, Get, Patch, UseGuards, Param, Body, Delete } from '@nestjs/common';
import { UsersService } from './users.service';
import { User } from 'src/auth/decorator';
import { UserRoles } from 'src/common/roles/user-roles.decorator';
import { RolesGuard } from 'src/common/roles/roles.guard';
import { Role } from '../common/roles/roles.enum';
import { JwtGuard } from 'src/auth/guard';
import * as userDto from './dto/users.dto';
import {
    ApiTags,
    ApiOperation,
    ApiResponse,
    ApiBearerAuth,
    ApiParam,
    ApiBody,
    ApiUnauthorizedResponse,
    ApiForbiddenResponse
} from '@nestjs/swagger';

@ApiTags('Users')  // Groups all user endpoints under 'Users' in Swagger UI
@ApiBearerAuth()  // Indicates all endpoints require Bearer token authentication
@UseGuards(JwtGuard)
@Controller('users')
export class UsersController {
    constructor(private readonly usersService: UsersService) { }

    // Endpoint to get all users (excluding the currently authenticated user)
    @Get()
    @UserRoles(Role.ADMIN)
    @UseGuards(RolesGuard)
    @ApiOperation({ summary: 'Get all users (Admin only)' })
    @ApiResponse({ status: 200, description: 'Users retrieved successfully' })
    @ApiResponse({ status: 404, description: 'No users found' })
    @ApiUnauthorizedResponse({ description: 'Unauthorized' })
    @ApiForbiddenResponse({ description: 'Forbidden (Admin access required)' })
    getAllUsers(@User('id') userId: string) {
        return this.usersService.getAllUsers(userId);
    }

    // Endpoint to get a user by their ID, check if they are authorized to access the user details
    @Get(':id')
    @ApiOperation({ summary: 'Get user by ID' })
    @ApiResponse({ status: 200, description: 'User retrieved successfully' })
    @ApiResponse({ status: 404, description: 'User not found' })
    @ApiUnauthorizedResponse({ description: 'Unauthorized action' })
    @ApiParam({ name: 'id', description: 'User ID to retrieve', type: String })
    getUserById(@User('id') userId: string, @User('role') userRole: string, @Param('id') id: string) {
        return this.usersService.getUserById(userId, userRole, id);
    }

    // Endpoint to update a user by ID with proper authorization checks
    @Patch(':id')
    @ApiOperation({ summary: 'Update user by ID' })
    @ApiResponse({ status: 200, description: 'User updated successfully' })
    @ApiResponse({ status: 404, description: 'User not found' })
    @ApiUnauthorizedResponse({ description: 'Unauthorized action or only admin can update role' })
    @ApiParam({ name: 'id', description: 'User ID to update', type: String })
    @ApiBody({ type: userDto.updateProfileDto })
    updateUserById(@User('id') userId: string, @User('role') userRole: string, @Param('id') id: string, @Body() updateProfileDto: userDto.updateProfileDto) {
        return this.usersService.updateUserById(userId, userRole, id, updateProfileDto);
    }

    // Endpoint to delete a user by ID with proper authorization checks
    @Delete(':id')
    @UserRoles(Role.ADMIN)
    @UseGuards(RolesGuard)
    @ApiOperation({ summary: 'Delete user by ID (Admin only)' })
    @ApiResponse({ status: 200, description: 'User deleted successfully' })
    @ApiResponse({ status: 404, description: 'User not found' })
    @ApiUnauthorizedResponse({ description: 'Unauthorized' })
    @ApiForbiddenResponse({ description: 'Forbidden (Admin access required)' })
    @ApiParam({ name: 'id', description: 'User ID to delete', type: String })
    deleteUserById(@Param('id') id: string) {
        return this.usersService.deleteUserById(id);
    }

    // Endpoint to get the accessible documents by specific user ID
    @Get(':id/documents')
    @ApiOperation({ summary: 'Get accessible documents for user' })
    @ApiResponse({ status: 200, description: 'Documents retrieved successfully' })
    @ApiResponse({ status: 404, description: 'User not found' })
    @ApiParam({ name: 'id', description: 'User ID to get documents for', type: String })
    getUserDocuments(@Param('id') id: string) {
        return this.usersService.getUserDocuments(id);
    }
}