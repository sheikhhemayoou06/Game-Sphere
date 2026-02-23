import { Controller, Get, Post, Put, Param, Body, Query, UseGuards, Request } from '@nestjs/common';
import { TournamentsService } from './tournaments.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('tournaments')
export class TournamentsController {
    constructor(private tournamentsService: TournamentsService) { }

    @Get()
    findAll(
        @Query('sportId') sportId?: string,
        @Query('status') status?: string,
        @Query('level') level?: string,
    ) {
        return this.tournamentsService.findAll({ sportId, status, level });
    }

    @Get(':id')
    findOne(@Param('id') id: string) {
        return this.tournamentsService.findOne(id);
    }

    @Get(':id/stats')
    getStats(@Param('id') id: string) {
        return this.tournamentsService.getStats(id);
    }

    @UseGuards(JwtAuthGuard)
    @Post()
    create(@Request() req: any, @Body() data: any) {
        return this.tournamentsService.create(req.user.sub, data);
    }

    @UseGuards(JwtAuthGuard)
    @Put(':id')
    update(@Param('id') id: string, @Request() req: any, @Body() data: any) {
        return this.tournamentsService.update(id, req.user.sub, data);
    }

    @UseGuards(JwtAuthGuard)
    @Put(':id/status')
    updateStatus(@Param('id') id: string, @Body('status') status: string) {
        return this.tournamentsService.updateStatus(id, status);
    }

    @UseGuards(JwtAuthGuard)
    @Post(':id/teams')
    addTeam(@Param('id') id: string, @Body('teamId') teamId: string) {
        return this.tournamentsService.addTeam(id, teamId);
    }

    @UseGuards(JwtAuthGuard)
    @Put(':id/teams/:teamId/approve')
    approveTeam(@Param('id') id: string, @Param('teamId') teamId: string) {
        return this.tournamentsService.approveTeam(id, teamId);
    }

    @UseGuards(JwtAuthGuard)
    @Post(':id/fixtures')
    generateFixtures(@Param('id') id: string) {
        return this.tournamentsService.generateFixtures(id);
    }

    // ═══════ Teams ═══════

    @Get(':id/teams')
    getTournamentTeams(@Param('id') id: string) {
        return this.tournamentsService.getTournamentTeams(id);
    }

    @UseGuards(JwtAuthGuard)
    @Put(':id/teams/:teamId/withdraw')
    withdrawTeam(@Param('id') id: string, @Param('teamId') teamId: string) {
        return this.tournamentsService.withdrawTeam(id, teamId);
    }

    @UseGuards(JwtAuthGuard)
    @Put(':id/teams/:teamId/reject')
    rejectTeam(@Param('id') id: string, @Param('teamId') teamId: string) {
        return this.tournamentsService.rejectTeam(id, teamId);
    }

    // ═══════ Financials & Leaderboard ═══════

    @UseGuards(JwtAuthGuard)
    @Get(':id/financials')
    getFinancials(@Param('id') id: string) {
        return this.tournamentsService.getTournamentFinancials(id);
    }

    @Get(':id/leaderboard')
    getLeaderboard(@Param('id') id: string) {
        return this.tournamentsService.getLeaderboard(id);
    }

    // ═══════ Chat ═══════

    @Get(':id/chat')
    getChatMessages(@Param('id') id: string) {
        return this.tournamentsService.getChatMessages(id);
    }

    @UseGuards(JwtAuthGuard)
    @Post(':id/chat')
    sendChatMessage(@Param('id') id: string, @Request() req: any, @Body() body: { message: string; type?: string }) {
        return this.tournamentsService.sendChatMessage(id, req.user.sub, body.message, body.type);
    }

    // ═══════ Media ═══════

    @Get(':id/media')
    getMedia(@Param('id') id: string) {
        return this.tournamentsService.getMedia(id);
    }

    @UseGuards(JwtAuthGuard)
    @Post(':id/media')
    addMedia(@Param('id') id: string, @Request() req: any, @Body() body: any) {
        return this.tournamentsService.addMedia(id, req.user.sub, body);
    }
}
