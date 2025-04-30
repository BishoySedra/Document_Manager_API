// user-roles.decorator.ts
import { SetMetadata } from '@nestjs/common';
import { Role } from './roles.enum';

export const UserRoles = (...roles: Role[]) => SetMetadata('roles', roles);
