import { Module } from '@nestjs/common';
import { EntriesController } from './entries.controller';
import { EntriesService } from './entries.service';
import { WsModule } from '../ws/ws.module';
import { TagsModule } from '../tags/tags.module';

@Module({
  imports: [WsModule, TagsModule],
  controllers: [EntriesController],
  providers: [EntriesService],
  exports: [EntriesService],
})
export class EntriesModule {}
