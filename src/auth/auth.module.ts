import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { JwtStrategy, JwtRefreshStrategy } from './strategy/jwt.strategy';
import { JwtModule } from '@nestjs/jwt';

@Module({
  imports: [JwtModule.register({
    secret: process.env.JWT_SECRET || 'secretKey'
  })],
  controllers: [AuthController],
  providers: [AuthService, JwtStrategy, JwtRefreshStrategy]
})

export class AuthModule { }
