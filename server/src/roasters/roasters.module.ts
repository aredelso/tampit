import { Module } from '@nestjs/common';
import { RoastersController } from './roasters.controller';
import { RoastersService } from './roasters.service';
import { EntriesModule } from '../entries/entries.module';
import { AiModule } from '../ai/ai.module';

@Module({
  imports: [EntriesModule, AiModule],
  controllers: [RoastersController],
  providers: [RoastersService],
})
export class RoastersModule {}
