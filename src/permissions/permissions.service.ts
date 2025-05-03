import { HttpStatus, Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { PermissionDto, UpdatePermissionDto } from './dto/permissions.dto';
import { Permission } from '@prisma/client';
import { CustomException } from 'src/common/exceptions/custom.exception';
import { AppResponse } from 'src/common/utils/response.util';


@Injectable()
export class PermissionsService {

    // Injecting the prisma service here
    constructor(private readonly prisma: PrismaService) { }

    // Service to set access control
    async setAccessControl(accessControlDto: PermissionDto) {

        // Destructure the DTO
        const { documentId, userId, permission } = accessControlDto;

        // check if the permission already exists
        const existingPermission = await this.prisma.documentPermission.findUnique({
            where: {
                documentId_userId: {
                    documentId,
                    userId
                }
            }
        });

        // If the permission already exists, throw an exception
        if (existingPermission) {
            throw new CustomException("Permission already exists", HttpStatus.CONFLICT);
        }

        // Check if the document exists
        const documentExists = await this.prisma.document.findUnique({
            where: { id: documentId }
        });

        // If the document does not exist, throw an exception
        if (!documentExists) {
            throw new CustomException("Document not found", HttpStatus.NOT_FOUND);
        }

        // Check if the user exists
        const userExists = await this.prisma.user.findUnique({
            where: { id: userId }
        });

        // If the user does not exist, throw an exception
        if (!userExists) {
            throw new CustomException("User not found", HttpStatus.NOT_FOUND);
        }

        // Create the permission in the database
        const createdPermission = await this.prisma.documentPermission.create({
            data: {
                documentId,
                userId,
                permission,
            }
        });

        // Return the created permission
        return AppResponse.format(HttpStatus.CREATED, "Permission created successfully", createdPermission);
    }

    // Service to update permission by ID
    async updatePermission(id: string, accessControlDto: UpdatePermissionDto) {

        // Check if the permission exists
        const existingPermission = await this.prisma.documentPermission.findUnique({
            where: { id }
        });

        // If the permission does not exist, throw an exception
        if (!existingPermission) {
            throw new CustomException("Permission not found", 404);
        }

        // Check if the same permission already exists
        if (existingPermission.permission === accessControlDto.permission) {
            throw new CustomException("Permission already exists", HttpStatus.CONFLICT);
        }

        // Update the permission in the database
        const updatedPermission = await this.prisma.documentPermission.update({
            where: { id },
            data: {
                permission: accessControlDto.permission,
            }
        });

        return AppResponse.format(HttpStatus.OK, "Permission updated successfully", updatedPermission);

    }

    // Service to delete permission by ID
    async deletePermission(id: string) {
        // Check if the permission exists
        const existingPermission = await this.prisma.documentPermission.findUnique({
            where: { id }
        });

        // If the permission does not exist, throw an exception
        if (!existingPermission) {
            throw new CustomException("Permission not found", 404);
        }

        // Delete the permission in the database

        await this.prisma.documentPermission.delete({
            where: { id }
        });

        return AppResponse.format(HttpStatus.OK, "Permission deleted successfully", null);
    }

}
