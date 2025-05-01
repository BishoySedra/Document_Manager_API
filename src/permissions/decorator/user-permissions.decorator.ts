import { SetMetadata } from "@nestjs/common";
import { Permission } from "@prisma/client";

export const UserPermissions = (...permissions: Permission[]) => SetMetadata('permissions', permissions);
// This decorator is used to set metadata for user permissions on a route handler.