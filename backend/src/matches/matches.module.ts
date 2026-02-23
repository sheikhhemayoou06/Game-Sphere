import { Module } from '@nestjs/common';
import { MatchesService } from './matches.service';
import { MatchesController } from './matches.controller';
import { MatchGateway } from './match.gateway';

@Module({
    controllers: [MatchesController],
    providers: [MatchesService, MatchGateway],
    exports: [MatchesService],
})
export class MatchesModule { }
