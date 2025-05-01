// user-roles.decorator.ts
import { SetMetadata } from '@nestjs/common';
import { Role } from '@prisma/client';

export const UserRoles = (...roles: Role[]) => SetMetadata('roles', roles);
