import { Controller, UseGuards, Get } from '@nestjs/common';
import { jwtGuard } from '../auth/guard/jwt.guard';
import { UsersService } from './users.service';

@UseGuards(jwtGuard)
@Controller('users')
export class UsersController {
    constructor(private readonly userService: UsersService) { }
}
