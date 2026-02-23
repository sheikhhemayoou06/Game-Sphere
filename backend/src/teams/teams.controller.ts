import { Controller, Get, Post, Put, Delete, Param, Body, Query, UseGuards, Request } from '@nestjs/common';
import { TeamsService } from './teams.service';
import { OwnerDashboardService } from './owner-dashboard.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('teams')
export class TeamsController {
    constructor(
        private teamsService: TeamsService,
        private ownerDashboardService: OwnerDashboardService,
    ) { }

    @Get()
    findAll() {
        return this.teamsService.findAll();
    }

    @UseGuards(JwtAuthGuard)
    @Get('my-sports')
    getMySports(@Request() req: any) {
        return this.teamsService.getMySports(req.user.sub);
    }

    @UseGuards(JwtAuthGuard)
    @Get('my')
    getMyTeams(@Request() req: any, @Query('sportId') sportId?: string) {
        return this.teamsService.getMyTeams(req.user.sub, sportId);
    }

    @UseGuards(JwtAuthGuard)
    @Get('dashboard')
    getOwnerDashboard(@Request() req: any, @Query('sportId') sportId: string) {
        return this.ownerDashboardService.getDashboard(req.user.sub, sportId);
    }

    @Get(':id')
    findOne(@Param('id') id: string) {
        return this.teamsService.findOne(id);
    }

    @UseGuards(JwtAuthGuard)
    @Post()
    create(@Request() req: any, @Body() data: any) {
        return this.teamsService.create(req.user.sub, data);
    }

    @UseGuards(JwtAuthGuard)
    @Put(':id')
    update(@Param('id') id: string, @Request() req: any, @Body() data: any) {
        return this.teamsService.update(id, req.user.sub, data);
    }

    @UseGuards(JwtAuthGuard)
    @Post(':id/players')
    addPlayer(
        @Param('id') teamId: string,
        @Body() data: { playerId: string; jersey?: number; role?: string },
    ) {
        return this.teamsService.addPlayer(teamId, data.playerId, data.jersey, data.role);
    }

    @UseGuards(JwtAuthGuard)
    @Delete(':id/players/:playerId')
    removePlayer(@Param('id') teamId: string, @Param('playerId') playerId: string) {
        return this.teamsService.removePlayer(teamId, playerId);
    }
}
