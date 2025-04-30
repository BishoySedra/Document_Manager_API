// roles.guard.ts
import { Injectable, CanActivate, ExecutionContext, UnauthorizedException, ForbiddenException, HttpStatus } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Observable } from 'rxjs';
import { Role } from '@prisma/client';
import { CustomException } from '../exceptions/custom.exception';

@Injectable()
export class RolesGuard implements CanActivate {
    constructor(private reflector: Reflector) { }

    canActivate(context: ExecutionContext): boolean | Promise<boolean> | Observable<boolean> {
        const requiredRoles = this.reflector.get<Role[]>('roles', context.getHandler());
        if (!requiredRoles) {
            return true;  // No role required, allow access
        }

        const request = context.switchToHttp().getRequest();
        const user = request.user; // Assuming the user object is set by the JWT strategy

        if (!user) {
            throw new CustomException('Unauthorized or user not found!', HttpStatus.UNAUTHORIZED);
        }

        // Check if user has at least one of the required roles
        const hasRole = requiredRoles.includes(user.role);  // Compare against user's role

        console.log(`User role: ${user.role}, Required roles: ${requiredRoles}, Has role: ${hasRole}`);

        if (!hasRole) {
            throw new CustomException('Forbidden access to this resource!', HttpStatus.FORBIDDEN);
        }

        return true;
    }
}
