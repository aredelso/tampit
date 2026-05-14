import { Module } from '@nestjs/common';
import { RoastersController } from './roasters.controller';
import { RoastersService } from './roasters.service';
import { EntriesModule } from '../entries/entries.module';

@Module({
  imports: [EntriesModule],
  controllers: [RoastersController],
  providers: [RoastersService],
})
export class RoastersModule {}
