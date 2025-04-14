import { HttpCode, HttpStatus, Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CustomException } from '../common/exceptions/custom.exception';
import * as bcrypt from 'bcrypt';
import { JwtService } from "@nestjs/jwt";
import { ConfigService } from '@nestjs/config';
import * as AuthDto from './dto/auth.dto';
import { AppResponse } from 'src/common/utils/response.util';

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
        const user = await this.prisma.user.findUnique({
            where: { email: data.email },
        });

        if (!user || !(await bcrypt.compare(data.password, user.password))) {
            throw new CustomException('Invalid credentials', HttpStatus.UNAUTHORIZED);
        }

        const tokens = await this.generateTokens(user.id, user.email);
        await this.updateRefreshToken(user.id, tokens.refresh_token);

        return {
            ...tokens,
            user: {
                id: user.id,
                name: user.name,
                email: user.email,
            },
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

        return {
            ...tokens,
            user: {
                id: user.id,
                name: user.name,
                email: user.email,
            },
        };
    }


    // service method to generate tokens
    async generateTokens(id: string, email: string) {
        const payload = { id, email };

        const [accessToken, refreshToken] = await Promise.all([
            this.jwtService.signAsync(payload, {
                secret: this.config.get('JWT_SECRET'),
                expiresIn: '15m',
            }),
            this.jwtService.signAsync(payload, {
                secret: this.config.get('JWT_REFRESH_SECRET'),
                expiresIn: '7d',
            }),
        ]);

        return { access_token: accessToken, refresh_token: refreshToken };
    }

    // service method to update refresh token
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
