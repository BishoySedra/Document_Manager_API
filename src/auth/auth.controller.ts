import { Controller, Post, Body, Patch, UseGuards, Get, HttpStatus } from '@nestjs/common';
import { AuthService } from './auth.service';
import * as AuthDto from './dto/auth.dto';
import { User } from './decorator';
import { JwtGuard, JwtRefreshGuard } from './guard/jwt.guard';
import { ApiBearerAuth, ApiOperation, ApiResponse } from '@nestjs/swagger';

@Controller('auth')
export class AuthController {

    //injecting the AuthService
    constructor(private readonly authService: AuthService) { }

    // endpoint to register a user
    @Post("register")
    @ApiOperation({ summary: 'Register a new user' })
    @ApiResponse({ status: HttpStatus.CREATED, description: 'User registered successfully' })
    @ApiResponse({ status: HttpStatus.BAD_REQUEST, description: 'User already exists' })
    @ApiResponse({ status: HttpStatus.INTERNAL_SERVER_ERROR, description: 'Internal server error' })
    register(@Body() authDto: AuthDto.RegisterDto) {
        return this.authService.register(authDto);
    }

    // endpoint to login a user
    @Post("login")
    @ApiOperation({ summary: 'Login a user' })
    @ApiResponse({ status: HttpStatus.OK, description: 'User logged in successfully' })
    @ApiResponse({ status: HttpStatus.UNAUTHORIZED, description: 'Invalid credentials' })
    @ApiResponse({ status: HttpStatus.INTERNAL_SERVER_ERROR, description: 'Internal server error' })
    login(@Body() authDto: AuthDto.LoginDto) {
        return this.authService.login(authDto);
    }

    // endpoint to refresh token
    @UseGuards(JwtRefreshGuard)
    @Post("refresh")
    @ApiOperation({ summary: 'Refresh user token' })
    @ApiBearerAuth()
    @ApiResponse({ status: HttpStatus.OK, description: 'User token refreshed successfully' })
    @ApiResponse({ status: HttpStatus.UNAUTHORIZED, description: 'Invalid credentials' })
    @ApiResponse({ status: HttpStatus.INTERNAL_SERVER_ERROR, description: 'Internal server error' })
    refreshToken(@User('id') userId: string, @User('refreshToken') refreshToken: string) {
        return this.authService.refreshToken(userId, refreshToken);
    }

    // endpoint to logout a user
    @UseGuards(JwtGuard)
    @Post('logout')
    @ApiOperation({ summary: 'Logout a user' })
    @ApiBearerAuth()
    @ApiResponse({ status: HttpStatus.OK, description: 'User logged out successfully' })
    logout(@User('id') userId: string) {
        return this.authService.logout(userId);
    }

    // endpoint to get user profile
    @UseGuards(JwtGuard)
    @Get("profile")
    @ApiOperation({ summary: 'Get user profile' })
    @ApiBearerAuth()
    @ApiResponse({ status: 200, description: 'User profile retrieved successfully' })
    @ApiResponse({ status: 401, description: 'Unauthorized' })
    @ApiResponse({ status: 500, description: 'Internal server error' })
    profile(@User() userInfo: any) {
        return this.authService.profile(userInfo);
    }

    // endpoint to change password
    @UseGuards(JwtGuard)
    @Patch("password")
    @ApiOperation({ summary: 'Change user password' })
    @ApiBearerAuth()
    @ApiResponse({ status: HttpStatus.OK, description: 'Password changed successfully!' })
    @ApiResponse({ status: HttpStatus.UNAUTHORIZED, description: 'Invalid credentials' })
    @ApiResponse({ status: HttpStatus.INTERNAL_SERVER_ERROR, description: 'Internal server error' })
    changePassword(@Body() data: AuthDto.ChangePasswordDto, @User('id') userId: string) {
        return this.authService.changePassword(data, userId);
    }

}
