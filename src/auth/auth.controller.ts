import { Controller, Post, Body } from '@nestjs/common';
import { AuthService } from './auth.service';
import * as AuthDto from './dto/auth.dto';

@Controller('auth')
export class AuthController {

    //injecting the AuthService
    constructor(private readonly authService: AuthService) { }

    // endpoint to register a user
    @Post("register")
    register(@Body() authDto: AuthDto.RegisterDto) {
        return this.authService.register(authDto);
    }

    // endpoint to login a user
    @Post("login")
    login(@Body() authDto: AuthDto.LoginDto) {
        return this.authService.login(authDto);
    }

}
