import { HttpCode, HttpStatus, Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CustomException } from '../common/exceptions/custom.exception';
import * as bcrypt from 'bcrypt';
import { JwtService } from "@nestjs/jwt";
import { ConfigService } from '@nestjs/config';
import * as AuthDto from './dto/auth.dto';
import { AppResponse } from 'src/common/utils/response.util';
import { access } from 'fs';

@Injectable()
export class AuthService {

    // injecting prisma service
    constructor(
        private prisma: PrismaService,
        private jwtService: JwtService,
        private config: ConfigService
    ) { }

    // service method to register a user
    async register(data: AuthDto.RegisterDto) {
        // check if user already exists
        const userExists = await this.prisma.user.findUnique({
            where: {
                email: data.email,
            },
        });

        // if user already exists, throw exception
        if (userExists) {
            throw new CustomException('User already exists', HttpStatus.BAD_REQUEST);
        }

        // hash password
        const hashedPassword = await bcrypt.hash(data.password, parseInt(this.config.get('SALT_ROUNDS')) || 10);
        // console.log("here 0");

        // create user
        const user = await this.prisma.user.create({
            data: {
                name: data.name,
                email: data.email,
                password: hashedPassword,
            },
        });

        // return user without password
        return {
            id: user.id,
            name: user.name,
            email: user.email,
        };
    }


    // service method to login a user
    async login(data: AuthDto.LoginDto) {

        // check if user exists
        const user = await this.prisma.user.findUnique({
            where: {
                email: data.email,
            },
        });

        // if user does not exist, throw exception
        if (!user) {
            throw new CustomException('Invalid credentials', HttpStatus.UNAUTHORIZED);
        }

        // console.log("here 1");

        // compare password
        const isPasswordValid = await bcrypt.compare(data.password, user.password);

        // if password is invalid, throw exception
        if (!isPasswordValid) {
            throw new CustomException('Invalid credentials', HttpStatus.UNAUTHORIZED);
        }

        // console.log("here 2");

        // generate JWT token
        const payload: AuthDto.AuthPayload = {
            id: user.id,
            email: user.email,
        };
        const token = this.jwtService.sign(payload);

        // console.log("here 3");

        // return user without password and token
        return {
            access_token: token
        };
    }


    // service method to get user profile
    async profile(userInfo: AuthDto.AuthPayload) {
        return userInfo;
    }

    // service method to change password
    async changePassword(data: AuthDto.ChangePasswordDto, userId: string) {
        // check if user exists
        const user = await this.prisma.user.findUnique({
            where: {
                id: userId,
            },
        });

        // if user does not exist, throw exception
        if (!user) {
            throw new CustomException('User not found', HttpStatus.NOT_FOUND);
        }

        // compare old password
        const isOldPasswordValid = await bcrypt.compare(data.oldPassword, user.password);

        // if old password is invalid, throw exception
        if (!isOldPasswordValid) {
            throw new CustomException('Invalid credentials', HttpStatus.UNAUTHORIZED);
        }

        // hash new password
        const hashedNewPassword = await bcrypt.hash(data.newPassword, parseInt(this.config.get('SALT_ROUNDS')) || 10);

        // update password
        await this.prisma.user.update({
            where: {
                id: userId,
            },
            data: {
                password: hashedNewPassword,
            },
        });

        // return success message
        return AppResponse.format(HttpStatus.OK, 'Password changed successfully!', null);
    }

}
