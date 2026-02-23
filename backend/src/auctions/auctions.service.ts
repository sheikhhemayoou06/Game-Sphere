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
                    include: {
                        player: {
                            include: {
                                user: {
                                    select: { firstName: true, lastName: true, avatar: true },
                                },
                            },
                        },
                        bids: { orderBy: { amount: 'desc' } },
                    },
                },
            },
        });

        if (!auction) return null;

        // Calculate team purses
        const teams = await this.prisma.tournamentTeam.findMany({
            where: { tournamentId },
            include: { team: true }
        });

        const teamPurses = await Promise.all(teams.map(async (t) => {
            const wins = await this.prisma.auctionPlayer.findMany({
                where: { auctionId: auction.id, soldToTeamId: t.teamId, status: 'SOLD' },
            });
            const spent = wins.reduce((sum, p) => sum + (p.soldPrice || 0), 0);
            return {
                teamId: t.teamId,
                teamName: t.team.name,
                logo: t.team.logo,
                spent,
                remainingPurse: auction.teamBudget - spent,
                playersBought: wins.length,
            };
        }));

        return { ...auction, teamPurses };
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
        // Enforce Budget
        const auctionPlayer = await this.prisma.auctionPlayer.findUnique({
            where: { id: auctionPlayerId },
            include: { auction: true },
        });

        if (!auctionPlayer) throw new NotFoundException('Player not found in auction');

        // Calculate total spent by this team in this auction
        const teamWins = await this.prisma.auctionPlayer.findMany({
            where: { auctionId: auctionPlayer.auctionId, soldToTeamId: teamId, status: 'SOLD' },
        });

        const totalSpent = teamWins.reduce((sum, p) => sum + (p.soldPrice || 0), 0);
        const remainingPurse = auctionPlayer.auction.teamBudget - totalSpent;

        if (amount > remainingPurse) {
            throw new ForbiddenException(`Bid amount exceeds remaining purse (₹${remainingPurse})`);
        }

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
