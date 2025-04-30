import { Controller, Get, UseGuards, Param } from '@nestjs/common';
import { UsersService } from './users.service';
import { User } from 'src/auth/decorator';
import { UserRoles } from 'src/common/roles/user-roles.decorator';
import { RolesGuard } from 'src/common/roles/roles.guard';
import { Role } from '../common/roles/roles.enum';
import { JwtGuard } from 'src/auth/guard';

@UseGuards(JwtGuard)
@Controller('users')
export class UsersController {
    // Inject the UsersService
    constructor(private readonly usersService: UsersService) { }

    // Endpoint to get all users
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

}
