import { PassportStrategy } from "@nestjs/passport";
import { ExtractJwt, Strategy } from "passport-jwt";
import { ConfigService } from "@nestjs/config";
import { Injectable } from "@nestjs/common";
import { AuthPayload } from "../dto";
import { PrismaService } from "../../prisma/prisma.service";

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
            throw new Error('Unauthorized');
        }

        delete user.password;

        return user;
    }
}