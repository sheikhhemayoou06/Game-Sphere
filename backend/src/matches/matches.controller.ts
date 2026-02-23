import { Controller, Get, Put, Param, Body, Query, UseGuards } from '@nestjs/common';
import { MatchesService } from './matches.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('matches')
export class MatchesController {
    constructor(private matchesService: MatchesService) { }

    @Get()
    findAll(
        @Query('tournamentId') tournamentId?: string,
        @Query('status') status?: string,
        @Query('sportId') sportId?: string,
    ) {
        return this.matchesService.findAll({ tournamentId, status, sportId });
    }

    @Get('live')
    getLiveMatches() {
        return this.matchesService.getLiveMatches();
    }

    @Get('upcoming')
    getUpcomingMatches() {
        return this.matchesService.getUpcomingMatches();
    }

    @Get(':id')
    findOne(@Param('id') id: string) {
        return this.matchesService.findOne(id);
    }

    @UseGuards(JwtAuthGuard)
    @Put(':id/score')
    updateScore(@Param('id') id: string, @Body() scoreData: any) {
        return this.matchesService.updateScore(id, scoreData);
    }

    @UseGuards(JwtAuthGuard)
    @Put(':id/complete')
    completeMatch(@Param('id') id: string, @Body() data: any) {
        return this.matchesService.completeMatch(id, data);
    }

    @UseGuards(JwtAuthGuard)
    @Put(':id/player-stats/:playerId')
    updatePlayerStats(
        @Param('id') matchId: string,
        @Param('playerId') playerId: string,
        @Body() statsData: any,
    ) {
        return this.matchesService.updatePlayerStats(matchId, playerId, statsData);
    }
}
