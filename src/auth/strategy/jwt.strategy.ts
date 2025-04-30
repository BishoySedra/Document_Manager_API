import { PassportStrategy } from "@nestjs/passport";
import { ExtractJwt, Strategy } from "passport-jwt";
import { ConfigService } from "@nestjs/config";
import { HttpStatus, Injectable } from "@nestjs/common";
import { AuthPayload } from "../dto";
import { PrismaService } from "../../prisma/prisma.service";
import { Request } from "express";
import { CustomException } from "src/common/exceptions/custom.exception";

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy, 'jwt') {

    constructor(config: ConfigService, private prismaService: PrismaService) {
        super({
            jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
            secretOrKey: config.get<string>('JWT_SECRET'),
        })
    }

    async validate(payload: AuthPayload) {
        const user = await this.prismaService.user.findUnique({
            where: {
                id: payload.id,
            }
        });

        if (!user) {
            throw new CustomException('Unauthorized', HttpStatus.UNAUTHORIZED);
        }

        delete user.password;

        return user;
    }
}

@Injectable()
export class JwtRefreshStrategy extends PassportStrategy(Strategy, 'jwt-refresh') {
    constructor(
        config: ConfigService,
        private prismaService: PrismaService,
    ) {
        super({
            jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
            secretOrKey: config.get<string>('JWT_REFRESH_SECRET'),
            ignoreExpiration: false,
            passReqToCallback: true,
        });
    }

    async validate(req: Request, payload: AuthPayload) {
        const refreshToken = req.get('Authorization')?.replace('Bearer ', '');

        const user = await this.prismaService.user.findUnique({
            where: { id: payload.id },
        });

        if (!user || !user.hashedRt) {
            throw new Error('Unauthorized');
        }

        delete user.password;

        return { ...user, refreshToken };
    }
}
