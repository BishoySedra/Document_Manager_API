import { Module } from '@nestjs/common';
import { DocumentService } from './documents.service';
import { DocumentsController } from './documents.controller';

@Module({
  providers: [DocumentService],
  controllers: [DocumentsController],
})
export class DocumentsModule { }
