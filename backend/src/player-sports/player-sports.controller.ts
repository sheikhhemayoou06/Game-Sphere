import { Controller, Get, Post, Param, Body, UseGuards } from '@nestjs/common';
import { PlayerSportsService } from './player-sports.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('players')
export class PlayerSportsController {
    constructor(private playerSportsService: PlayerSportsService) { }

    @UseGuards(JwtAuthGuard)
    @Post(':playerId/sports')
    registerForSport(
        @Param('playerId') playerId: string,
        @Body() body: { sportId: string },
    ) {
        return this.playerSportsService.registerForSport(playerId, body.sportId);
    }

    @Get(':playerId/sports')
    getPlayerSports(@Param('playerId') playerId: string) {
        return this.playerSportsService.getPlayerSports(playerId);
    }
}
