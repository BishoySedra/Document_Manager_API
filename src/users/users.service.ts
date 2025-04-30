import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CustomException } from 'src/common/exceptions/custom.exception';

@Injectable()
export class UsersService {

    // inject the prisma service
    constructor(private readonly prismaService: PrismaService) { }

    // service to get all users
    async getAllUsers(userId: string) {
        // find all users in the database
        const users = await this.prismaService.user.findMany({
            where: {
                id: {
                    not: userId, // exclude the current user
                },
            },
            select: {
                id: true,
                email: true,
                name: true,
                role: true,
            },
        });

        return users;
    }

    // service to get user by id
    async getUserById(currentUserId: string, currentUserRole: string, specificUserId: string) {
        if (currentUserRole !== "ADMIN" && currentUserId !== specificUserId) {
            throw new CustomException('You are not authorized to view this user', 403);
        }

        // find the user in the database
        const user = await this.prismaService.user.findUnique({
            where: {
                id: specificUserId,
            },
            select: {
                id: true,
                email: true,
                name: true,
                role: true,
            },
        });

        // if user not found, throw an exception
        if (!user) {
            throw new CustomException('User not found', 404);
        }

        return user;
    }

}
