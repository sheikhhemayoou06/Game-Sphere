import { Module } from '@nestjs/common';
import { TeamsService } from './teams.service';
import { TeamsController } from './teams.controller';
import { OwnerDashboardService } from './owner-dashboard.service';

@Module({
    controllers: [TeamsController],
    providers: [TeamsService, OwnerDashboardService],
    exports: [TeamsService],
})
export class TeamsModule { }
