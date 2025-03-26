import { Global, Module } from '@nestjs/common';
import { PrismaService } from './prisma.service';

@Global() // 👈 make PrismaModule global to use from other modules
@Module({
  providers: [PrismaService],
  exports: [PrismaService], // 👈 export PrismaService
})
export class PrismaModule { }
