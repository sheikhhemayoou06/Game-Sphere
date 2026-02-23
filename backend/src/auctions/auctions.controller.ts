import { Controller, Get, Post, Put, Param, Body, UseGuards, Request } from '@nestjs/common';
import { AuctionsService } from './auctions.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('tournaments/:tournamentId/auction')
export class AuctionsController {
    constructor(private auctionsService: AuctionsService) { }

    @Get()
    getAuction(@Param('tournamentId') tournamentId: string) {
        return this.auctionsService.getAuction(tournamentId);
    }

    @UseGuards(JwtAuthGuard)
    @Post()
    createAuction(@Param('tournamentId') tournamentId: string, @Body('teamBudget') teamBudget?: number) {
        return this.auctionsService.createAuction(tournamentId, teamBudget);
    }

    @UseGuards(JwtAuthGuard)
    @Put(':auctionId/status')
    updateStatus(@Param('auctionId') auctionId: string, @Body('status') status: string) {
        return this.auctionsService.updateAuctionStatus(auctionId, status);
    }

    @UseGuards(JwtAuthGuard)
    @Post(':auctionId/players')
    addPlayer(@Param('auctionId') auctionId: string, @Body() body: { playerId: string; basePrice?: number }) {
        return this.auctionsService.addPlayerToAuction(auctionId, body.playerId, body.basePrice);
    }

    @UseGuards(JwtAuthGuard)
    @Put('players/:auctionPlayerId/approve')
    approvePlayer(@Param('auctionPlayerId') auctionPlayerId: string) {
        return this.auctionsService.approvePlayer(auctionPlayerId);
    }

    @UseGuards(JwtAuthGuard)
    @Put('players/:auctionPlayerId/bid')
    placeBid(@Param('auctionPlayerId') apId: string, @Body() body: { teamId: string; amount: number }) {
        return this.auctionsService.placeBid(apId, body.teamId, body.amount);
    }

    @UseGuards(JwtAuthGuard)
    @Put('players/:auctionPlayerId/sell')
    sellPlayer(@Param('auctionPlayerId') apId: string, @Body() body: { teamId: string; soldPrice: number }) {
        return this.auctionsService.sellPlayer(apId, body.teamId, body.soldPrice);
    }

    @UseGuards(JwtAuthGuard)
    @Put('players/:auctionPlayerId/unsold')
    markUnsold(@Param('auctionPlayerId') auctionPlayerId: string) {
        return this.auctionsService.markUnsold(auctionPlayerId);
    }
}
