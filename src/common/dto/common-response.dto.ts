import { ApiProperty } from '@nestjs/swagger';

/**
 * Standard API response format following JSend specification
 */
export class ApiResponseDto<T = any> {
  @ApiProperty({
    description: 'HTTP status code',
    example: 200,
  })
  status: number;

  @ApiProperty({
    description: 'Response message describing the operation result',
    example: 'Operation completed successfully',
  })
  message: string;

  @ApiProperty({
    description: 'Response data payload',
    required: false,
  })
  body?: T;
}

/**
 * Success response for authentication operations
 */
export class AuthResponseDto {
  @ApiProperty({
    description: 'JWT access token',
    example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
  })
  accessToken: string;

  @ApiProperty({
    description: 'JWT refresh token',
    example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
  })
  refreshToken: string;

  @ApiProperty({
    description: 'User information',
  })
  user: UserResponseDto;
}

/**
 * User information response
 */
export class UserResponseDto {
  @ApiProperty({
    description: 'User unique identifier',
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  id: string;

  @ApiProperty({
    description: 'User full name',
    example: 'John Doe',
  })
  name: string;

  @ApiProperty({
    description: 'User email address',
    example: 'john.doe@example.com',
  })
  email: string;

  @ApiProperty({
    description: 'User role in the system',
    enum: ['USER', 'ADMIN'],
    example: 'USER',
  })
  role: string;

  @ApiProperty({
    description: 'Account creation timestamp',
    example: '2024-01-01T00:00:00.000Z',
  })
  createdAt: Date;

  @ApiProperty({
    description: 'Last account update timestamp',
    example: '2024-01-01T00:00:00.000Z',
  })
  updatedAt: Date;
}

/**
 * Document information response
 */
export class DocumentResponseDto {
  @ApiProperty({
    description: 'Document unique identifier',
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  id: string;

  @ApiProperty({
    description: 'Document title',
    example: 'Project Report 2024',
  })
  title: string;

  @ApiProperty({
    description: 'Document description',
    example: 'Annual project report containing financial data and analysis',
    required: false,
  })
  description?: string;

  @ApiProperty({
    description: 'Document tags for categorization',
    example: ['REPORT', 'INVOICE'],
    isArray: true,
  })
  tags: string[];

  @ApiProperty({
    description: 'File path in storage system',
    example: '/documents/550e8400-e29b-41d4-a716-446655440000/report.pdf',
  })
  filePath: string;

  @ApiProperty({
    description: 'File type',
    enum: ['PDF', 'DOCX', 'DOC', 'CSV', 'XLS', 'XLSX', 'PPT', 'PPTX', 'TXT'],
    example: 'PDF',
  })
  fileType: string;

  @ApiProperty({
    description: 'File size in bytes',
    example: 1024000,
  })
  fileSize: number;

  @ApiProperty({
    description: 'ID of user who uploaded the document',
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  uploadedById: string;

  @ApiProperty({
    description: 'Folder ID containing this document',
    example: '550e8400-e29b-41d4-a716-446655440000',
    required: false,
  })
  folderId?: string;

  @ApiProperty({
    description: 'Document creation timestamp',
    example: '2024-01-01T00:00:00.000Z',
  })
  createdAt: Date;

  @ApiProperty({
    description: 'Last document update timestamp',
    example: '2024-01-01T00:00:00.000Z',
  })
  updatedAt: Date;
}

/**
 * Folder information response
 */
export class FolderResponseDto {
  @ApiProperty({
    description: 'Folder unique identifier',
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  id: string;

  @ApiProperty({
    description: 'Folder name',
    example: 'Project Documents',
  })
  name: string;

  @ApiProperty({
    description: 'Parent folder ID',
    example: '550e8400-e29b-41d4-a716-446655440000',
    required: false,
  })
  parentFolderId?: string;

  @ApiProperty({
    description: 'ID of user who created the folder',
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  createdById: string;

  @ApiProperty({
    description: 'Folder creation timestamp',
    example: '2024-01-01T00:00:00.000Z',
  })
  createdAt: Date;

  @ApiProperty({
    description: 'Last folder update timestamp',
    example: '2024-01-01T00:00:00.000Z',
  })
  updatedAt: Date;
}

/**
 * Permission information response
 */
export class PermissionResponseDto {
  @ApiProperty({
    description: 'Permission unique identifier',
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  id: string;

  @ApiProperty({
    description: 'Document ID for this permission',
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  documentId: string;

  @ApiProperty({
    description: 'User ID for this permission',
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  userId: string;

  @ApiProperty({
    description: 'Permission type granted',
    enum: ['VIEW', 'EDIT', 'DOWNLOAD'],
    example: 'VIEW',
  })
  permission: string;

  @ApiProperty({
    description: 'Permission creation timestamp',
    example: '2024-01-01T00:00:00.000Z',
  })
  createdAt: Date;

  @ApiProperty({
    description: 'Last permission update timestamp',
    example: '2024-01-01T00:00:00.000Z',
  })
  updatedAt: Date;
}

/**
 * Error response format
 */
export class ErrorResponseDto {
  @ApiProperty({
    description: 'HTTP status code',
    example: 400,
  })
  status: number;

  @ApiProperty({
    description: 'Error message',
    example: 'Validation failed',
  })
  message: string;

  @ApiProperty({
    description: 'Additional error details',
    example: ['Email is required', 'Password must be at least 6 characters'],
    required: false,
  })
  body?: string | string[] | object;
}