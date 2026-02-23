import { Module } from '@nestjs/common';
import { PlayerSportsController } from './player-sports.controller';
import { PlayerSportsService } from './player-sports.service';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
    imports: [PrismaModule],
    controllers: [PlayerSportsController],
    providers: [PlayerSportsService],
    exports: [PlayerSportsService],
})
export class PlayerSportsModule { }
