import { Controller, Post, Body, Patch, UseGuards, Get } from '@nestjs/common';
import { AuthService } from './auth.service';
import * as AuthDto from './dto/auth.dto';
import { User } from './decorator';
import { JwtGuard, JwtRefreshGuard } from './guard/jwt.guard';
import { 
  ApiTags, 
  ApiOperation, 
  ApiResponse, 
  ApiBody, 
  ApiBearerAuth, 
  ApiUnauthorizedResponse,
  ApiBadRequestResponse,
  ApiCreatedResponse,
  ApiOkResponse
} from '@nestjs/swagger';
import { 
  ApiResponseDto, 
  AuthResponseDto, 
  UserResponseDto, 
  ErrorResponseDto 
} from '../common/dto/common-response.dto';

/**
 * Authentication Controller
 * 
 * Handles user authentication, registration, profile management, and token operations.
 * Provides endpoints for user registration, login, password management, token refresh, and logout.
 */
@ApiTags('Authentication')
@Controller('auth')
export class AuthController {
  /**
   * Inject the AuthService dependency
   */
  constructor(private readonly authService: AuthService) {}

  /**
   * Register a new user account
   * 
   * Creates a new user account with the provided registration details.
   * Returns authentication tokens upon successful registration.
   */
  @Post('register')
  @ApiOperation({ 
    summary: 'Register a new user account',
    description: `
      Register a new user with email, password, and optional role.
      Default role is USER if not specified. Admin role can only be assigned by existing admins.
      Returns JWT tokens for immediate authentication after registration.
    `,
  })
  @ApiCreatedResponse({ 
    description: 'User registered successfully',
    type: ApiResponseDto<AuthResponseDto>,
    example: {
      status: 201,
      message: 'User registered successfully',
      body: {
        accessToken: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
        refreshToken: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
        user: {
          id: '550e8400-e29b-41d4-a716-446655440000',
          name: 'John Doe',
          email: 'john.doe@example.com',
          role: 'USER',
          createdAt: '2024-01-01T00:00:00.000Z',
          updatedAt: '2024-01-01T00:00:00.000Z'
        }
      }
    }
  })
  @ApiBadRequestResponse({ 
    description: 'Registration failed - validation errors or user already exists',
    type: ErrorResponseDto,
    example: {
      status: 400,
      message: 'User already exists',
      body: null
    }
  })
  @ApiBody({ type: AuthDto.RegisterDto })
  register(@Body() authDto: AuthDto.RegisterDto) {
    return this.authService.register(authDto);
  }

  /**
   * Authenticate user with email and password
   * 
   * Validates user credentials and returns authentication tokens.
   */
  @Post('login')
  @ApiOperation({ 
    summary: 'Authenticate user login',
    description: `
      Authenticate user with email and password.
      Returns JWT access token and refresh token for subsequent API calls.
      Access tokens expire in 15 minutes, refresh tokens expire in 7 days.
    `,
  })
  @ApiOkResponse({ 
    description: 'User authenticated successfully',
    type: ApiResponseDto<AuthResponseDto>,
    example: {
      status: 200,
      message: 'User logged in successfully',
      body: {
        accessToken: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
        refreshToken: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
        user: {
          id: '550e8400-e29b-41d4-a716-446655440000',
          name: 'John Doe',
          email: 'john.doe@example.com',
          role: 'USER',
          createdAt: '2024-01-01T00:00:00.000Z',
          updatedAt: '2024-01-01T00:00:00.000Z'
        }
      }
    }
  })
  @ApiUnauthorizedResponse({ 
    description: 'Invalid credentials provided',
    type: ErrorResponseDto,
    example: {
      status: 401,
      message: 'Invalid credentials',
      body: null
    }
  })
  @ApiBody({ type: AuthDto.LoginDto })
  login(@Body() authDto: AuthDto.LoginDto) {
    return this.authService.login(authDto);
  }

  /**
   * Get authenticated user profile
   * 
   * Retrieves the profile information of the currently authenticated user.
   */
  @UseGuards(JwtGuard)
  @Get('profile')
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ 
    summary: 'Get current user profile',
    description: `
      Retrieve profile information for the currently authenticated user.
      Requires valid JWT token in Authorization header.
    `,
  })
  @ApiOkResponse({ 
    description: 'User profile retrieved successfully',
    type: ApiResponseDto<UserResponseDto>,
    example: {
      status: 200,
      message: 'User profile retrieved successfully',
      body: {
        id: '550e8400-e29b-41d4-a716-446655440000',
        name: 'John Doe',
        email: 'john.doe@example.com',
        role: 'USER',
        createdAt: '2024-01-01T00:00:00.000Z',
        updatedAt: '2024-01-01T00:00:00.000Z'
      }
    }
  })
  @ApiUnauthorizedResponse({ 
    description: 'Authentication required',
    type: ErrorResponseDto
  })
  profile(@User() userInfo: any) {
    return this.authService.profile(userInfo);
  }

  /**
   * Change user password
   * 
   * Allows authenticated users to change their password by providing current and new passwords.
   */
  @UseGuards(JwtGuard)
  @Patch('password')
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ 
    summary: 'Change user password',
    description: `
      Change the password for the currently authenticated user.
      Requires current password for verification and new password for update.
    `,
  })
  @ApiOkResponse({ 
    description: 'Password changed successfully',
    type: ApiResponseDto,
    example: {
      status: 200,
      message: 'Password changed successfully',
      body: null
    }
  })
  @ApiUnauthorizedResponse({ 
    description: 'Invalid current password or authentication required',
    type: ErrorResponseDto
  })
  @ApiBody({ type: AuthDto.ChangePasswordDto })
  changePassword(@Body() data: AuthDto.ChangePasswordDto, @User('id') userId: string) {
    return this.authService.changePassword(data, userId);
  }

  /**
   * Refresh authentication token
   * 
   * Generate new access token using valid refresh token.
   */
  @UseGuards(JwtRefreshGuard)
  @Post('refresh')
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ 
    summary: 'Refresh access token',
    description: `
      Generate a new access token using a valid refresh token.
      Refresh tokens are long-lived and used to obtain new access tokens when they expire.
    `,
  })
  @ApiOkResponse({ 
    description: 'Access token refreshed successfully',
    type: ApiResponseDto<{ accessToken: string }>,
    example: {
      status: 200,
      message: 'Token refreshed successfully',
      body: {
        accessToken: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...'
      }
    }
  })
  @ApiUnauthorizedResponse({ 
    description: 'Invalid or expired refresh token',
    type: ErrorResponseDto
  })
  refreshToken(@User('id') userId: string, @User('refreshToken') refreshToken: string) {
    return this.authService.refreshToken(userId, refreshToken);
  }

  /**
   * Logout user
   * 
   * Invalidate user session and clear refresh token.
   */
  @UseGuards(JwtGuard)
  @Post('logout')
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ 
    summary: 'Logout user',
    description: `
      Logout the currently authenticated user.
      Invalidates the refresh token and clears user session.
    `,
  })
  @ApiOkResponse({ 
    description: 'User logged out successfully',
    type: ApiResponseDto,
    example: {
      status: 200,
      message: 'Logged out successfully',
      body: null
    }
  })
  @ApiUnauthorizedResponse({ 
    description: 'Authentication required',
    type: ErrorResponseDto
  })
  logout(@User('id') userId: string) {
    return this.authService.logout(userId);
  }
}