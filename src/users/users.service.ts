import { HttpStatus, Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CustomException } from 'src/common/exceptions/custom.exception';
import * as userDto from './dto/users.dto';
import { Role } from '@prisma/client';
import { AppResponse } from 'src/common/utils/response.util';

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

        // if no users found, throw an exception
        if (!users || users.length === 0) {
            throw new CustomException('No users found', HttpStatus.NOT_FOUND);
        }

        return AppResponse.format(HttpStatus.OK, 'Users retrieved successfully', users);
    }

    // service to get user by id
    async getUserById(currentUserId: string, currentUserRole: string, specificUserId: string) {

        // check if the current user is an admin or is trying to access their own account
        await this.checkAuthorization(currentUserId, currentUserRole, specificUserId);

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
            throw new CustomException('User not found', HttpStatus.NOT_FOUND);
        }

        // return the user without the password
        return AppResponse.format(HttpStatus.OK, `User with ID ${user.id} retrieved successfully`, user);
    }

    // service to update user by id
    async updateUserById(currentUserId: string, currentUserRole: string, specificUserId: string, updateProfileDto: userDto.updateProfileDto) {
        // check if the current user is an admin or is trying to access their own account
        await this.checkAuthorization(currentUserId, currentUserRole, specificUserId);

        // getting the current user from the database
        if (currentUserRole !== Role.ADMIN && updateProfileDto.role) {
            throw new CustomException('Only admin can update user role', HttpStatus.UNAUTHORIZED);
        }

        // find the user in the database
        const user = await this.prismaService.user.findUnique({
            where: {
                id: specificUserId,
            },
        });

        // if user not found, throw an exception
        if (!user) {
            throw new CustomException('User not found', HttpStatus.NOT_FOUND);
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

        return AppResponse.format(HttpStatus.OK, `User with ID ${updatedUser.id} updated successfully`, userWithoutPassword);
    }

    // service to delete user by id
    async deleteUserById(specificUserId: string) {

        // find the user in the database
        const user = await this.prismaService.user.findUnique({
            where: {
                id: specificUserId,
            },
        });

        // if user not found, throw an exception
        if (!user) {
            throw new CustomException('User not found', HttpStatus.NOT_FOUND);
        }

        // delete the user in the database
        const deletedUser = await this.prismaService.user.delete({
            where: {
                id: specificUserId,
            },
        });

        if (!deletedUser) {
            throw new CustomException('User not deleted', HttpStatus.NOT_FOUND);
        }

        return AppResponse.format(HttpStatus.OK, `User with ID ${deletedUser.id} deleted successfully`, null);
    }

    // helper method to check if the current user can access the requested resource
    async checkAuthorization(currentUserId: string, currentUserRole: string, targetUserId: string) {
        if (currentUserRole !== Role.ADMIN && currentUserId !== targetUserId) {
            throw new CustomException('Unauthorized action', HttpStatus.UNAUTHORIZED);
        }
    }

    // service to get the accessible documents by specific user ID
    async getUserDocuments(id: string) {
        // find the user in the database
        const documents = await this.prismaService.user.findUnique({
            where: {
                id
            },
            include: {
                documentPermissions: {
                    include: {
                        document: true,
                    }, omit: {
                        id: true,
                        documentId: true,
                        userId: true
                    }
                }
            }
        })


        // if user not found, throw an exception
        if (!documents) {
            throw new CustomException('User not found', HttpStatus.NOT_FOUND);
        }

        return AppResponse.format(HttpStatus.OK, "Documents retrieved successfully", documents.documentPermissions);
    }
}
