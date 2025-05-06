import { Controller, Get, Patch, UseGuards, Param, Body, Delete, HttpStatus } from '@nestjs/common';
import { UsersService } from './users.service';
import { User } from 'src/auth/decorator';
import { UserRoles } from 'src/common/roles/user-roles.decorator';
import { RolesGuard } from 'src/common/roles/roles.guard';
import { Role } from '../common/roles/roles.enum';
import { JwtGuard } from 'src/auth/guard';
import * as userDto from './dto/users.dto';
import { ApiBearerAuth, ApiOperation, ApiResponse } from "@nestjs/swagger"

@UseGuards(JwtGuard)
@Controller('users')
export class UsersController {
    constructor(private readonly usersService: UsersService) { }

    // Endpoint to get all users (excluding the currently authenticated user)
    @Get()
    @UserRoles(Role.ADMIN)
    @UseGuards(RolesGuard)
    @ApiOperation({ summary: 'Get all users by admin' })
    @ApiBearerAuth()
    @ApiResponse({ status: HttpStatus.OK, description: 'Users retrieved successfully' })
    @ApiResponse({ status: HttpStatus.UNAUTHORIZED, description: 'Unauthorized' })
    @ApiResponse({ status: HttpStatus.FORBIDDEN, description: 'Forbidden' })
    @ApiResponse({ status: HttpStatus.INTERNAL_SERVER_ERROR, description: 'Internal server error' })
    getAllUsers(@User('id') userId: string) {
        return this.usersService.getAllUsers(userId);
    }

    // Endpoint to get a user by their ID, check if they are authorized to access the user details
    @Get(':id')
    @ApiOperation({ summary: 'Get user by ID by admin or the user themselves' })
    @ApiBearerAuth()
    @ApiResponse({ status: HttpStatus.OK, description: 'User retrieved successfully' })
    @ApiResponse({ status: HttpStatus.UNAUTHORIZED, description: 'Unauthorized' })
    @ApiResponse({ status: HttpStatus.FORBIDDEN, description: 'Forbidden' })
    @ApiResponse({ status: HttpStatus.INTERNAL_SERVER_ERROR, description: 'Internal server error' })
    getUserById(@User('id') userId: string, @User('role') userRole: string, @Param('id') id: string) {
        return this.usersService.getUserById(userId, userRole, id);
    }

    // Endpoint to get the accessible documents by specific user ID
    @Get(':id/documents')
    @ApiOperation({ summary: 'Get user documents by ID' })
    @ApiBearerAuth()
    @ApiResponse({ status: HttpStatus.OK, description: 'User documents retrieved successfully' })
    @ApiResponse({ status: HttpStatus.UNAUTHORIZED, description: 'Unauthorized' })
    @ApiResponse({ status: HttpStatus.FORBIDDEN, description: 'Forbidden' })
    @ApiResponse({ status: HttpStatus.INTERNAL_SERVER_ERROR, description: 'Internal server error' })
    getUserDocuments(@Param('id') id: string) {
        return this.usersService.getUserDocuments(id);
    }

    // Endpoint to update a user by ID with proper authorization checks
    @Patch(':id')
    @ApiOperation({ summary: 'Update user by ID by admin or the user themselves' })
    @ApiBearerAuth()
    @ApiResponse({ status: HttpStatus.OK, description: 'User updated successfully' })
    @ApiResponse({ status: HttpStatus.UNAUTHORIZED, description: 'Unauthorized' })
    @ApiResponse({ status: HttpStatus.FORBIDDEN, description: 'Forbidden' })
    @ApiResponse({ status: HttpStatus.INTERNAL_SERVER_ERROR, description: 'Internal server error' })
    updateUserById(@User('id') userId: string, @User('role') userRole: string, @Param('id') id: string, @Body() updateProfileDto: userDto.updateProfileDto) {
        return this.usersService.updateUserById(userId, userRole, id, updateProfileDto);
    }

    // Endpoint to delete a user by ID with proper authorization checks
    @Delete(':id')
    @UserRoles(Role.ADMIN)
    @UseGuards(RolesGuard)
    @ApiOperation({ summary: 'Delete user by ID by admin' })
    @ApiBearerAuth()
    @ApiResponse({ status: HttpStatus.OK, description: 'User deleted successfully' })
    @ApiResponse({ status: HttpStatus.UNAUTHORIZED, description: 'Unauthorized' })
    @ApiResponse({ status: HttpStatus.FORBIDDEN, description: 'Forbidden' })
    @ApiResponse({ status: HttpStatus.INTERNAL_SERVER_ERROR, description: 'Internal server error' })
    deleteUserById(@Param('id') id: string) {
        return this.usersService.deleteUserById(id);
    }

}
