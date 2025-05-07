import { Controller, Post, Body, Patch, UseGuards, Get } from '@nestjs/common';
import { AuthService } from './auth.service';
import * as AuthDto from './dto/auth.dto';
import { User } from './decorator';
import { JwtGuard, JwtRefreshGuard } from './guard/jwt.guard';
import { userInfo } from 'os';
import { ApiTags, ApiOperation, ApiResponse, ApiBody, ApiBearerAuth } from '@nestjs/swagger';

@ApiTags('Authentication')  // Groups all auth endpoints under 'Authentication' in Swagger UI
@Controller('auth')
export class AuthController {

    //injecting the AuthService
    constructor(private readonly authService: AuthService) { }

    // endpoint to register a user
    @Post("register")
    @ApiOperation({ summary: 'Register a new user' })  // Adds a summary for this endpoint
    @ApiResponse({ status: 201, description: 'User registered successfully' })  // Documents successful response
    @ApiResponse({ status: 400, description: 'User already exists' })  // Documents error response
    @ApiBody({ type: AuthDto.RegisterDto })  // Documents the expected request body
    register(@Body() authDto: AuthDto.RegisterDto) {
        return this.authService.register(authDto);
    }

    // endpoint to login a user
    @Post("login")
    @ApiOperation({ summary: 'Login a user' })
    @ApiResponse({ status: 200, description: 'User logged in successfully' })
    @ApiResponse({ status: 401, description: 'Invalid credentials' })
    @ApiBody({ type: AuthDto.LoginDto })
    login(@Body() authDto: AuthDto.LoginDto) {
        return this.authService.login(authDto);
    }

    // endpoint to get user profile
    @UseGuards(JwtGuard)
    @Get("profile")
    @ApiBearerAuth()  // Indicates this endpoint requires Bearer token authentication
    @ApiOperation({ summary: 'Get user profile' })
    @ApiResponse({ status: 200, description: 'User profile retrieved successfully' })
    @ApiResponse({ status: 401, description: 'Unauthorized' })
    profile(@User() userInfo: any) {
        return this.authService.profile(userInfo);
    }

    // endpoint to change password
    @UseGuards(JwtGuard)
    @Patch("password")
    @ApiBearerAuth()
    @ApiOperation({ summary: 'Change user password' })
    @ApiResponse({ status: 200, description: 'Password changed successfully' })
    @ApiResponse({ status: 401, description: 'Invalid credentials' })
    @ApiBody({ type: AuthDto.ChangePasswordDto })
    changePassword(@Body() data: AuthDto.ChangePasswordDto, @User('id') userId: string) {
        return this.authService.changePassword(data, userId);
    }

    // endpoint to refresh token
    @UseGuards(JwtRefreshGuard)
    @Post("refresh")
    @ApiBearerAuth()
    @ApiOperation({ summary: 'Refresh access token' })
    @ApiResponse({ status: 200, description: 'User token refreshed successfully' })
    @ApiResponse({ status: 401, description: 'Invalid credentials' })
    refreshToken(@User('id') userId: string, @User('refreshToken') refreshToken: string) {
        return this.authService.refreshToken(userId, refreshToken);
    }

    // endpoint to logout a user
    @UseGuards(JwtGuard)
    @Post('logout')
    @ApiBearerAuth()
    @ApiOperation({ summary: 'Logout user' })
    @ApiResponse({ status: 200, description: 'Logged out successfully' })
    @ApiResponse({ status: 401, description: 'Unauthorized' })
    logout(@User('id') userId: string) {
        return this.authService.logout(userId);
    }
}