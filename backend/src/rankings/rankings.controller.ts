import { Controller, Get, Post, Put, Query, Body, Param, UseGuards } from '@nestjs/common';
import { RankingsService } from './rankings.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('rankings')
export class RankingsController {
    constructor(private rankingsService: RankingsService) { }

    @Get()
    getLeaderboard(@Query('sportId') sportId?: string, @Query('level') level?: string) {
        return this.rankingsService.getLeaderboard(sportId, level);
    }

    @Get('player/:playerId')
    getPlayerRankings(@Param('playerId') playerId: string) {
        return this.rankingsService.getPlayerRankings(playerId);
    }

    @Get('team/:teamId')
    getTeamRankings(@Param('teamId') teamId: string) {
        return this.rankingsService.getTeamRankings(teamId);
    }

    @UseGuards(JwtAuthGuard)
    @Post()
    upsertRanking(@Body() data: any) {
        return this.rankingsService.upsertRanking(data);
    }

    @UseGuards(JwtAuthGuard)
    @Put('recalculate')
    recalculateRanks(@Query('sportId') sportId: string, @Query('level') level: string) {
        return this.rankingsService.recalculateRanks(sportId, level);
    }
}
