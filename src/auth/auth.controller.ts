import { Controller, Post, Body, Patch, UseGuards, Get } from '@nestjs/common';
import { AuthService } from './auth.service';
import * as AuthDto from './dto/auth.dto';
import { User } from './decorator';
import { jwtGuard } from './guard/jwt.guard';

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

    // endpoint to get user profile
    @UseGuards(jwtGuard)
    @Get("profile")
    profile(@User() userInfo: any) {
        return this.authService.profile(userInfo);
    }

    // endpoint to change password
    @UseGuards(jwtGuard)
    @Patch("password")
    changePassword(@Body() data: AuthDto.ChangePasswordDto, @User('id') userId: string) {
        return this.authService.changePassword(data, userId);
    }

}
