import { HttpStatus, Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CustomException } from '../common/exceptions/custom.exception';
import * as bcrypt from 'bcrypt';
import { JwtService } from "@nestjs/jwt";
import { ConfigService } from '@nestjs/config';
import * as AuthDto from './dto/auth.dto';
import { AppResponse } from 'src/common/utils/response.util';
import { Role } from '@prisma/client';

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

        let role: String = "USER";
        if (data.role) {
            role = this.getRole(data.role as string);
        }

        // hash password
        const hashedPassword = await bcrypt.hash(data.password, parseInt(this.config.get('SALT_ROUNDS')) || 10);
        // console.log("here 0");

        // create user
        const user = await this.prisma.user.create({
            data: {
                name: data.name,
                email: data.email,
                role: role as Role,
                password: hashedPassword,
            },
        });

        // return user without password
        return AppResponse.format(HttpStatus.CREATED, 'User registered successfully', {
            id: user.id,
            name: user.name,
            email: user.email,
            role: user.role,
        });
    }

    // helper method to get the right role
    getRole(role: string) {
        switch (role.toLowerCase()) {
            case 'admin':
                return 'ADMIN';
            case 'user':
                return 'USER';
            default:
                return 'USER';
        }
    }

    // service method to login a user
    async login(data: AuthDto.LoginDto) {
        const user = await this.prisma.user.findUnique({
            where: { email: data.email },
        });

        if (!user || !(await bcrypt.compare(data.password, user.password))) {
            throw new CustomException('Invalid credentials', HttpStatus.UNAUTHORIZED);
        }

        const tokens = await this.generateTokens(user.id, user.email);
        await this.updateRefreshToken(user.id, tokens.refresh_token);

        // return tokens
        return AppResponse.format(HttpStatus.OK, 'User logged in successfully', {
            access_token: tokens.access_token,
            refresh_token: tokens.refresh_token,
        });
    }

    // service method to get user profile
    async profile(userInfo: any) {

        // delete hashedRt from userInfo
        delete userInfo.hashedRt;

        // return user info
        return AppResponse.format(HttpStatus.OK, 'User profile retrieved successfully', userInfo);
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
            throw new CustomException('Invalid credentials', HttpStatus.UNAUTHORIZED);
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

    // service method to refresh token
    async refreshToken(userId: string, refreshToken: string) {
        const user = await this.prisma.user.findUnique({
            where: { id: userId },
        });

        if (!user || !user.hashedRt) {
            throw new CustomException('Invalid credentials', HttpStatus.UNAUTHORIZED);
        }

        const isRtValid = await bcrypt.compare(refreshToken, user.hashedRt);
        if (!isRtValid) {
            throw new CustomException('Invalid credentials', HttpStatus.UNAUTHORIZED);
        }

        const tokens = await this.generateTokens(user.id, user.email);
        await this.updateRefreshToken(user.id, tokens.refresh_token);

        return AppResponse.format(HttpStatus.OK, 'User token refreshed successfully', {
            access_token: tokens.access_token,
            refresh_token: tokens.refresh_token,
        });
    }

    // helper method to generate tokens
    async generateTokens(id: string, email: string) {
        const payload = { id, email };

        const [accessToken, refreshToken] = await Promise.all([
            this.jwtService.signAsync(payload, {
                secret: this.config.get('JWT_SECRET'),
                // expiresIn: this.config.get('JWT_ACCESS_EXPIRES_IN') || '15m',
            }),
            this.jwtService.signAsync(payload, {
                secret: this.config.get('JWT_REFRESH_SECRET'),
                expiresIn: this.config.get('JWT_REFRESH_EXPIRES_IN') || '7d',
            }),
        ]);

        return { access_token: accessToken, refresh_token: refreshToken };
    }

    // helper method to update refresh token
    async updateRefreshToken(userId: string, rt: string) {
        const hash = await bcrypt.hash(rt, parseInt(this.config.get('SALT_ROUNDS')) || 10);
        await this.prisma.user.update({
            where: { id: userId },
            data: { hashedRt: hash },
        });
    }

    // service method to logout user
    async logout(userId: string) {
        await this.prisma.user.update({
            where: { id: userId },
            data: { hashedRt: null },
        });

        return AppResponse.format(HttpStatus.OK, 'Logged out successfully', null);
    }

}
