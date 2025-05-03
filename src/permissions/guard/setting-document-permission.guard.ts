// document-permission.guard.ts
import { Injectable, CanActivate, ExecutionContext, ForbiddenException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { CustomException } from 'src/common/exceptions/custom.exception';
import { HttpStatus } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { Permission } from '@prisma/client';

// Make dictionary for permissions for each permission there is a number
const permissionsDictionary: { [key in Permission]: number } = {
    VIEW: 1,
    DOWNLOAD: 2,
    EDIT: 3
};

@Injectable()
export class SettingDocumentPermissionGuard implements CanActivate {
    constructor(private prismaService: PrismaService, private reflector: Reflector) { }

    async canActivate(context: ExecutionContext): Promise<boolean> {

        // Getting the required permissions from the handler metadata
        const requiredPermissions = this.reflector.get<Permission[]>('permissions', context.getHandler());

        if (!requiredPermissions) {
            return true;  // No permission required, allow access
        }

        // Getting the context of the request
        const request = context.switchToHttp().getRequest();

        // Getting the user in the request put by the JWT guard
        const user = request.user;  // User from JWT guard

        // Getting the permission ID from the request parameters
        const { id } = request.params;

        // Check if there's a permission for the user to access the document
        let permission = await this.prismaService.documentPermission.findUnique({
            where: {
                id
            },
        });

        // If there is no permission, throw an exception
        if (!permission) {
            throw new CustomException('You do not have permission to access this document or it does not exist', HttpStatus.FORBIDDEN);
        }

        // getting the document ID from the permission
        const documentId = permission.documentId;

        permission = await this.prismaService.documentPermission.findUnique({
            where: {
                documentId_userId: {
                    documentId,
                    userId: user.id,
                }
            },
        });

        // Check if permission of the user is greater than the required permission
        const userPermissionLevel = permissionsDictionary[permission.permission];
        const requiredPermissionLevel = Math.max(...requiredPermissions.map(permission => permissionsDictionary[permission]));

        if (userPermissionLevel < requiredPermissionLevel) {
            throw new CustomException('You do not have permission to access this document', HttpStatus.FORBIDDEN);
        }

        // If everything is ok, return true
        return true;
    }
}
