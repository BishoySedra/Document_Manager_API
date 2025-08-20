import { 
  Controller, 
  Get, 
  Patch, 
  Delete, 
  Param, 
  Body, 
  UseGuards 
} from '@nestjs/common';
import { UsersService } from './users.service';
import { User } from 'src/auth/decorator';
import { JwtGuard } from 'src/auth/guard';
import { UserRoles } from 'src/common/roles/user-roles.decorator';
import { RolesGuard } from 'src/common/roles/roles.guard';
import { Role } from '../common/roles/roles.enum';
import * as userDto from './dto/users.dto';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiParam,
  ApiBody,
  ApiUnauthorizedResponse,
  ApiForbiddenResponse,
  ApiNotFoundResponse,
  ApiOkResponse
} from '@nestjs/swagger';
import { 
  ApiResponseDto, 
  UserResponseDto, 
  DocumentResponseDto, 
  ErrorResponseDto 
} from '../common/dto/common-response.dto';

/**
 * Users Controller
 * 
 * Manages user profiles, administration, and user-related operations.
 * Provides endpoints for user management, profile updates, and user document access.
 */
@ApiTags('Users')
@ApiBearerAuth('JWT-auth')
@UseGuards(JwtGuard)
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  /**
   * Get all users (Admin only)
   * 
   * Retrieves a list of all users in the system. This endpoint is restricted to admin users only.
   */
  @Get()
  @UserRoles(Role.ADMIN)
  @UseGuards(RolesGuard)
  @ApiOperation({ 
    summary: 'Get all users (Admin only)',
    description: `
      Retrieve a comprehensive list of all users in the system.
      This endpoint is restricted to users with ADMIN role.
      Returns user profiles excluding the currently authenticated admin user.
    `,
  })
  @ApiOkResponse({ 
    description: 'Users retrieved successfully',
    type: ApiResponseDto<UserResponseDto[]>,
    example: {
      status: 200,
      message: 'Users retrieved successfully',
      body: [
        {
          id: '550e8400-e29b-41d4-a716-446655440000',
          name: 'John Doe',
          email: 'john.doe@example.com',
          role: 'USER',
          createdAt: '2024-01-01T00:00:00.000Z',
          updatedAt: '2024-01-01T00:00:00.000Z'
        }
      ]
    }
  })
  @ApiNotFoundResponse({ 
    description: 'No users found',
    type: ErrorResponseDto
  })
  @ApiUnauthorizedResponse({ 
    description: 'Authentication required',
    type: ErrorResponseDto
  })
  @ApiForbiddenResponse({ 
    description: 'Admin access required',
    type: ErrorResponseDto
  })
  getAllUsers(@User('id') userId: string) {
    return this.usersService.getAllUsers(userId);
  }

  /**
   * Get user by ID
   * 
   * Retrieves user profile information by user ID with proper authorization checks.
   */
  @Get(':id')
  @ApiOperation({ 
    summary: 'Get user profile by ID',
    description: `
      Retrieve user profile information by user ID.
      Users can access their own profile, while admins can access any user profile.
      Regular users cannot access other users' profiles.
    `,
  })
  @ApiOkResponse({ 
    description: 'User profile retrieved successfully',
    type: ApiResponseDto<UserResponseDto>,
    example: {
      status: 200,
      message: 'User retrieved successfully',
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
  @ApiNotFoundResponse({ 
    description: 'User not found',
    type: ErrorResponseDto
  })
  @ApiUnauthorizedResponse({ 
    description: 'Unauthorized access to user profile',
    type: ErrorResponseDto
  })
  @ApiParam({ 
    name: 'id', 
    description: 'User ID to retrieve', 
    type: String,
    example: '550e8400-e29b-41d4-a716-446655440000'
  })
  getUserById(
    @User('id') userId: string, 
    @User('role') userRole: string, 
    @Param('id') id: string
  ) {
    return this.usersService.getUserById(userId, userRole, id);
  }

  /**
   * Update user profile by ID
   * 
   * Updates user profile information with proper authorization and role management.
   */
  @Patch(':id')
  @ApiOperation({ 
    summary: 'Update user profile by ID',
    description: `
      Update user profile information including name, email, and role.
      Users can update their own profile (except role).
      Only admins can update user roles and other users' profiles.
    `,
  })
  @ApiOkResponse({ 
    description: 'User profile updated successfully',
    type: ApiResponseDto<UserResponseDto>,
    example: {
      status: 200,
      message: 'User updated successfully',
      body: {
        id: '550e8400-e29b-41d4-a716-446655440000',
        name: 'John Doe Updated',
        email: 'john.doe.updated@example.com',
        role: 'USER',
        createdAt: '2024-01-01T00:00:00.000Z',
        updatedAt: '2024-01-01T00:00:00.000Z'
      }
    }
  })
  @ApiNotFoundResponse({ 
    description: 'User not found',
    type: ErrorResponseDto
  })
  @ApiUnauthorizedResponse({ 
    description: 'Unauthorized access or only admin can update role',
    type: ErrorResponseDto
  })
  @ApiParam({ 
    name: 'id', 
    description: 'User ID to update', 
    type: String,
    example: '550e8400-e29b-41d4-a716-446655440000'
  })
  @ApiBody({ type: userDto.updateProfileDto })
  updateUserById(
    @User('id') userId: string, 
    @User('role') userRole: string, 
    @Param('id') id: string, 
    @Body() updateProfileDto: userDto.updateProfileDto
  ) {
    return this.usersService.updateUserById(userId, userRole, id, updateProfileDto);
  }

  /**
   * Delete user by ID (Admin only)
   * 
   * Permanently removes a user account from the system. This action is irreversible.
   */
  @Delete(':id')
  @UserRoles(Role.ADMIN)
  @UseGuards(RolesGuard)
  @ApiOperation({ 
    summary: 'Delete user account by ID (Admin only)',
    description: `
      Permanently delete a user account from the system.
      This action is irreversible and will remove all user data.
      Only admin users can perform this operation.
    `,
  })
  @ApiOkResponse({ 
    description: 'User account deleted successfully',
    type: ApiResponseDto,
    example: {
      status: 200,
      message: 'User deleted successfully',
      body: null
    }
  })
  @ApiNotFoundResponse({ 
    description: 'User not found',
    type: ErrorResponseDto
  })
  @ApiUnauthorizedResponse({ 
    description: 'Authentication required',
    type: ErrorResponseDto
  })
  @ApiForbiddenResponse({ 
    description: 'Admin access required',
    type: ErrorResponseDto
  })
  @ApiParam({ 
    name: 'id', 
    description: 'User ID to delete', 
    type: String,
    example: '550e8400-e29b-41d4-a716-446655440000'
  })
  deleteUserById(@Param('id') id: string) {
    return this.usersService.deleteUserById(id);
  }

  /**
   * Get user's accessible documents
   * 
   * Retrieves all documents that the specified user has access to view, edit, or download.
   */
  @Get(':id/documents')
  @ApiOperation({ 
    summary: 'Get user\'s accessible documents',
    description: `
      Retrieve all documents that the specified user has permission to access.
      Returns documents with their metadata and access permissions.
      Users can only access their own document list unless they are admins.
    `,
  })
  @ApiOkResponse({ 
    description: 'User documents retrieved successfully',
    type: ApiResponseDto<DocumentResponseDto[]>,
    example: {
      status: 200,
      message: 'User documents retrieved successfully',
      body: [
        {
          id: '550e8400-e29b-41d4-a716-446655440000',
          title: 'Project Report 2024',
          description: 'Annual project report',
          tags: ['REPORT'],
          filePath: '/documents/550e8400-e29b-41d4-a716-446655440000/report.pdf',
          fileType: 'PDF',
          fileSize: 1024000,
          uploadedById: '550e8400-e29b-41d4-a716-446655440000',
          folderId: null,
          createdAt: '2024-01-01T00:00:00.000Z',
          updatedAt: '2024-01-01T00:00:00.000Z'
        }
      ]
    }
  })
  @ApiNotFoundResponse({ 
    description: 'User not found or no documents found',
    type: ErrorResponseDto
  })
  @ApiUnauthorizedResponse({ 
    description: 'Authentication required',
    type: ErrorResponseDto
  })
  @ApiParam({ 
    name: 'id', 
    description: 'User ID to get documents for', 
    type: String,
    example: '550e8400-e29b-41d4-a716-446655440000'
  })
  getUserDocuments(@Param('id') id: string) {
    return this.usersService.getUserDocuments(id);
  }
}