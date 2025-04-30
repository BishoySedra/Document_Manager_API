import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CustomException } from 'src/common/exceptions/custom.exception';
import * as userDto from './dto/users.dto';
import { Role } from '@prisma/client';

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
        console.log(`currentUserId: ${currentUserId}, currentUserRole: ${currentUserRole}, specificUserId: ${specificUserId}`);
        // check if the current user is an admin or is trying to access their own account
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

    // service to update user by id
    async updateUserById(currentUserId: string, currentUserRole: string, specificUserId: string, updateProfileDto: userDto.updateProfileDto) {
        // check if the current user is an admin or is trying to access their own account
        if (currentUserRole !== "ADMIN" && currentUserId !== specificUserId) {
            throw new CustomException('You are not authorized to update this user', 403);
        }

        // find the user in the database
        const user = await this.prismaService.user.findUnique({
            where: {
                id: specificUserId,
            },
        });

        // if user not found, throw an exception
        if (!user) {
            throw new CustomException('User not found', 404);
        }

        // check the role if provided
        let role = updateProfileDto.role;
        if (role) {
            if (role !== "ADMIN" && role !== "USER") {
                throw new CustomException('Invalid role', 400);
            }
        }

        // update the user in the database
        const updatedUser = await this.prismaService.user.update({
            where: {
                id: specificUserId,
            },
            data: {
                name: updateProfileDto.name ? updateProfileDto.name : user.name,
                email: updateProfileDto.email ? updateProfileDto.email : user.email,
                role: updateProfileDto.role as Role ? updateProfileDto.role as Role : user.role// update the role if provided
            }
        });

        if (!updatedUser) {
            throw new CustomException('User not updated', 500);
        }

        // remove the password from the response
        const { password, ...userWithoutPassword } = updatedUser;

        return userWithoutPassword;

    }

}
