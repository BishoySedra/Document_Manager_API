import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class UsersService {

    // inject the prisma service
    constructor(private readonly prismaService: PrismaService) { }

    // method to get all users
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

}
