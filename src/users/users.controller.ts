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
    // Inject the UsersService
    constructor(private readonly usersService: UsersService) { }

    // Endpoint to get all users (ADMIN only)
    @Get()
    @UserRoles(Role.ADMIN)
    @UseGuards(RolesGuard)
    getAllUsers(@User('id') userId: string) {
        return this.usersService.getAllUsers(userId);
    }

    // Endpoint to get user by ID
    @Get(':id')
    getUserById(@User('id') userId: string, @User('role') userRole: string, @Param('id') id: string) {
        return this.usersService.getUserById(userId, userRole, id);
    }

    // Endpoint to update user by ID
    @Patch(':id')
    updateUserById(@User('id') userId: string, @User('role') userRole: string, @Param('id') id: string, @Body() updateProfileDto: userDto.updateProfileDto) {
        return this.usersService.updateUserById(userId, userRole, id, updateProfileDto);
    }

    // Endpoint to delete user by ID (ADMIN only)
    @Delete(':id')
    @UserRoles(Role.ADMIN)
    @UseGuards(RolesGuard)
    deleteUserById(@Param('id') id: string) {
        return this.usersService.deleteUserById(id);
    }
}
