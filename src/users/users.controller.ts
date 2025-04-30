import { Controller, Get, Patch, UseGuards, Param, Body, Delete } from '@nestjs/common';
import { UsersService } from './users.service';
import { User } from 'src/auth/decorator';
import { UserRoles } from 'src/common/roles/user-roles.decorator';
import { RolesGuard } from 'src/common/roles/roles.guard';
import { Role } from '../common/roles/roles.enum';
import { JwtGuard } from 'src/auth/guard';
import * as userDto from './dto/users.dto';

@UseGuards(JwtGuard)
@Controller('users')
export class UsersController {
    constructor(private readonly usersService: UsersService) { }

    // Endpoint to get all users (excluding the currently authenticated user)
    @Get()
    @UserRoles(Role.ADMIN)
    @UseGuards(RolesGuard)
    getAllUsers(@User('id') userId: string) {
        return this.usersService.getAllUsers(userId);
    }

    // Endpoint to get a user by their ID, check if they are authorized to access the user details
    @Get(':id')
    getUserById(@User('id') userId: string, @User('role') userRole: string, @Param('id') id: string) {
        return this.usersService.getUserById(userId, userRole, id);
    }

    // Endpoint to update a user by ID with proper authorization checks
    @Patch(':id')
    updateUserById(@User('id') userId: string, @User('role') userRole: string, @Param('id') id: string, @Body() updateProfileDto: userDto.updateProfileDto) {
        return this.usersService.updateUserById(userId, userRole, id, updateProfileDto);
    }

    // Endpoint to delete a user by ID with proper authorization checks
    @Delete(':id')
    @UserRoles(Role.ADMIN)
    @UseGuards(RolesGuard)
    deleteUserById(@Param('id') id: string) {
        return this.usersService.deleteUserById(id);
    }
}
