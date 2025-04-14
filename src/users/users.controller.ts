import { Controller, UseGuards, Get } from '@nestjs/common';
import { jwtGuard } from '../auth/guard/jwt.guard';
import { UsersService } from './users.service';
import { User } from 'src/auth/decorator';

@Controller('users')
export class UsersController {

}
