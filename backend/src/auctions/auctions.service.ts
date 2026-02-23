import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class AuctionsService {
    constructor(private prisma: PrismaService) { }

    async getAuction(tournamentId: string) {
        const auction = await this.prisma.auction.findFirst({
            where: { tournamentId },
            include: {
                players: {
                    include: { bids: { orderBy: { amount: 'desc' } } },
                },
            },
        });
        return auction;
    }

    async createAuction(tournamentId: string, teamBudget = 5000000) {
        return this.prisma.auction.create({
            data: { tournamentId, teamBudget },
        });
    }

    async updateAuctionStatus(auctionId: string, status: string) {
        return this.prisma.auction.update({
            where: { id: auctionId },
            data: { status },
        });
    }

    async addPlayerToAuction(auctionId: string, playerId: string, basePrice = 50000) {
        return this.prisma.auctionPlayer.create({
            data: { auctionId, playerId, basePrice },
        });
    }

    async approvePlayer(auctionPlayerId: string) {
        return this.prisma.auctionPlayer.update({
            where: { id: auctionPlayerId },
            data: { status: 'APPROVED' },
        });
    }

    async startBidding(auctionPlayerId: string) {
        return this.prisma.auctionPlayer.update({
            where: { id: auctionPlayerId },
            data: { status: 'IN_BIDDING' },
        });
    }

    async placeBid(auctionPlayerId: string, teamId: string, amount: number) {
        return this.prisma.auctionBid.create({
            data: { auctionPlayerId, teamId, amount },
        });
    }

    async sellPlayer(auctionPlayerId: string, teamId: string, soldPrice: number) {
        // Mark player as sold
        const auctionPlayer = await this.prisma.auctionPlayer.update({
            where: { id: auctionPlayerId },
            data: { status: 'SOLD', soldToTeamId: teamId, soldPrice },
        });

        // Auto-add to team squad
        await this.prisma.teamPlayer.create({
            data: { playerId: auctionPlayer.playerId, teamId },
        }).catch(() => { /* already in squad */ });

        return auctionPlayer;
    }

    async markUnsold(auctionPlayerId: string) {
        return this.prisma.auctionPlayer.update({
            where: { id: auctionPlayerId },
            data: { status: 'UNSOLD' },
        });
    }
}
