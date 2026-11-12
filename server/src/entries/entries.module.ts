import { Module } from '@nestjs/common';
import { EntriesController } from './entries.controller';
import { EntriesService } from './entries.service';
import { EntriesResolver } from './entries.resolver';
import { WsModule } from '../ws/ws.module';
import { TagsModule } from '../tags/tags.module';

@Module({
  imports: [WsModule, TagsModule],
  controllers: [EntriesController],
  providers: [EntriesService, EntriesResolver],
  exports: [EntriesService],
})
export class EntriesModule {}
