import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit, OnModuleDestroy {

    // This class extends PrismaClient to provide a Prisma client instance
    constructor(config: ConfigService) {
        super({
            datasources: {
                db: {
                    url: config.get<string>('DATABASE_URL'),
                },
            },
        });
    }

    // This method is called when the module is initialized
    async onModuleInit() {
        await this.$connect();
    }

    // This method is called when the module is destroyed
    async onModuleDestroy() {
        await this.$disconnect();
    }
}