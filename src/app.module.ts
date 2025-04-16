import { Module } from '@nestjs/common';
import { PrismaModule } from './prisma/prisma.module';
import { ConfigModule } from '@nestjs/config';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { DocumentsModule } from './documents/documents.module';
import { NestCloudinaryClientModule } from './nest-cloudinary-client/nest-cloudinary-client.module';

@Module({
  imports: [PrismaModule, ConfigModule.forRoot(
    {
      isGlobal: true,
    },
  ), AuthModule, UsersModule, DocumentsModule, NestCloudinaryClientModule],
  controllers: [],
  providers: [],
})
export class AppModule { }
