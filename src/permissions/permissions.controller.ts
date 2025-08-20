import { 
  Controller, 
  Post, 
  Patch, 
  Delete, 
  Body, 
  Param, 
  UseGuards 
} from '@nestjs/common';
import { PermissionsService } from './permissions.service';
import { PermissionDto, UpdatePermissionDto } from './dto/permissions.dto';
import { JwtGuard } from 'src/auth/guard';
import { UserPermissions } from './decorator/user-permissions.decorator';
import { Permission } from '@prisma/client';
import { SettingDocumentPermissionGuard } from './guard/setting-document-permission.guard';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiBody,
  ApiParam,
  ApiUnauthorizedResponse,
  ApiForbiddenResponse,
  ApiNotFoundResponse,
  ApiConflictResponse,
  ApiCreatedResponse,
  ApiOkResponse
} from '@nestjs/swagger';
import { 
  ApiResponseDto, 
  PermissionResponseDto, 
  ErrorResponseDto 
} from '../common/dto/common-response.dto';

/**
 * Permissions Controller
 * 
 * Manages document access permissions including creation, updates, and deletion
 * of user permissions for documents. Handles fine-grained access control.
 */
@ApiTags('Permissions')
@ApiBearerAuth('JWT-auth')
@UseGuards(JwtGuard)
@Controller('permissions')
export class PermissionsController {
  constructor(private readonly permissionsService: PermissionsService) {}

  /**
   * Set document permission for a user
   * 
   * Creates a new permission entry granting a user specific access to a document.
   */
  @Post()
  @ApiOperation({ 
    summary: 'Grant document permission to user',
    description: `
      Create a new permission entry to grant a user specific access to a document.
      
      **Permission Types:**
      - **VIEW**: User can view and download the document
      - **EDIT**: User can view, download, and modify document metadata
      - **DOWNLOAD**: User can download the document file
      
      **Authorization Rules:**
      - Document owners can grant any permission
      - Users with EDIT permission can grant VIEW and DOWNLOAD permissions
      - Users with VIEW permission cannot grant permissions to others
      - Admins can grant any permission to any document
      
      **Validation:**
      - Document must exist
      - Target user must exist
      - Permission cannot already exist for this user-document pair
      - Requester must have sufficient permissions
      
      **Use Cases:**
      - Share documents with team members
      - Grant temporary access to external users
      - Collaborative document workflows
    `,
  })
  @ApiCreatedResponse({ 
    description: 'Permission created successfully',
    type: ApiResponseDto<PermissionResponseDto>,
    example: {
      status: 201,
      message: 'Permission created successfully',
      body: {
        id: '550e8400-e29b-41d4-a716-446655440000',
        documentId: '550e8400-e29b-41d4-a716-446655440001',
        userId: '550e8400-e29b-41d4-a716-446655440002',
        permission: 'VIEW',
        createdAt: '2024-01-01T00:00:00.000Z',
        updatedAt: '2024-01-01T00:00:00.000Z'
      }
    }
  })
  @ApiConflictResponse({ 
    description: 'Permission already exists for this user and document',
    type: ErrorResponseDto,
    example: {
      status: 409,
      message: 'Permission already exists',
      body: null
    }
  })
  @ApiNotFoundResponse({ 
    description: 'Document or user not found',
    type: ErrorResponseDto
  })
  @ApiUnauthorizedResponse({ 
    description: 'Authentication required',
    type: ErrorResponseDto
  })
  @ApiForbiddenResponse({ 
    description: 'Insufficient permissions to grant access',
    type: ErrorResponseDto
  })
  @ApiBody({ type: PermissionDto })
  async setAccessControl(@Body() accessControlDto: PermissionDto) {
    return this.permissionsService.setAccessControl(accessControlDto);
  }

  /**
   * Update document permission
   * 
   * Modifies an existing permission entry to change the access level for a user.
   */
  @Patch(':id')
  @UserPermissions(Permission.EDIT)
  @UseGuards(SettingDocumentPermissionGuard)
  @ApiOperation({ 
    summary: 'Update existing document permission',
    description: `
      Update an existing permission entry to change the access level for a user.
      
      **Permission Hierarchy:**
      - **VIEW** < **DOWNLOAD** < **EDIT** (in terms of access level)
      - Users can upgrade permissions they have sufficient rights for
      - Users cannot downgrade permissions they don't have rights to manage
      
      **Update Rules:**
      - Document owners can change any permission level
      - Users with EDIT permission can modify VIEW and DOWNLOAD permissions
      - Users cannot modify their own permissions
      - Permission cannot be changed to an existing permission for the same user-document pair
      
      **Validation:**
      - Permission entry must exist
      - New permission level must be different from current
      - Requester must have sufficient permissions to make the change
      
      **Use Cases:**
      - Upgrade user access from VIEW to EDIT
      - Downgrade permissions when roles change
      - Temporary permission adjustments
    `,
  })
  @ApiOkResponse({ 
    description: 'Permission updated successfully',
    type: ApiResponseDto<PermissionResponseDto>,
    example: {
      status: 200,
      message: 'Permission updated successfully',
      body: {
        id: '550e8400-e29b-41d4-a716-446655440000',
        documentId: '550e8400-e29b-41d4-a716-446655440001',
        userId: '550e8400-e29b-41d4-a716-446655440002',
        permission: 'EDIT',
        createdAt: '2024-01-01T00:00:00.000Z',
        updatedAt: '2024-01-01T12:00:00.000Z'
      }
    }
  })
  @ApiNotFoundResponse({ 
    description: 'Permission entry not found',
    type: ErrorResponseDto
  })
  @ApiConflictResponse({ 
    description: 'User already has this permission level',
    type: ErrorResponseDto
  })
  @ApiUnauthorizedResponse({ 
    description: 'Authentication required',
    type: ErrorResponseDto
  })
  @ApiForbiddenResponse({ 
    description: 'Insufficient permissions to modify this access level',
    type: ErrorResponseDto
  })
  @ApiParam({ 
    name: 'id', 
    description: 'Permission entry ID to update', 
    type: String,
    example: '550e8400-e29b-41d4-a716-446655440000'
  })
  @ApiBody({ type: UpdatePermissionDto })
  async updatePermission(
    @Param('id') id: string, 
    @Body() accessControlDto: UpdatePermissionDto
  ) {
    return this.permissionsService.updatePermission(id, accessControlDto);
  }

  /**
   * Delete document permission
   * 
   * Removes a permission entry, revoking user access to a document.
   */
  @Delete(':id')
  @UserPermissions(Permission.EDIT)
  @UseGuards(SettingDocumentPermissionGuard)
  @ApiOperation({ 
    summary: 'Revoke document permission',
    description: `
      Remove a permission entry, completely revoking a user's access to a document.
      
      **⚠️ Access Revocation:**
      - User will immediately lose all access to the document
      - Cannot undo this action (must create new permission)
      - User will not be notified of access revocation
      
      **Authorization Rules:**
      - Document owners can revoke any permission
      - Users with EDIT permission can revoke VIEW and DOWNLOAD permissions
      - Users cannot revoke their own permissions
      - Admins can revoke any permission
      
      **Validation:**
      - Permission entry must exist
      - Requester must have sufficient permissions to revoke access
      - Cannot revoke the last EDIT permission if requester is not document owner
      
      **Use Cases:**
      - Remove access when user leaves team
      - Revoke temporary access permissions
      - Security incident response
      - Project completion cleanup
    `,
  })
  @ApiOkResponse({ 
    description: 'Permission revoked successfully',
    type: ApiResponseDto,
    example: {
      status: 200,
      message: 'Permission deleted successfully',
      body: null
    }
  })
  @ApiNotFoundResponse({ 
    description: 'Permission entry not found',
    type: ErrorResponseDto
  })
  @ApiUnauthorizedResponse({ 
    description: 'Authentication required',
    type: ErrorResponseDto
  })
  @ApiForbiddenResponse({ 
    description: 'Insufficient permissions to revoke this access',
    type: ErrorResponseDto
  })
  @ApiParam({ 
    name: 'id', 
    description: 'Permission entry ID to delete', 
    type: String,
    example: '550e8400-e29b-41d4-a716-446655440000'
  })
  async deletePermission(@Param('id') id: string) {
    return this.permissionsService.deletePermission(id);
  }
}