"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuctionsService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
let AuctionsService = class AuctionsService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async getAuction(tournamentId) {
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
        if (!auction)
            return null;
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
    async createAuction(tournamentId, teamBudget = 5000000) {
        return this.prisma.auction.create({
            data: { tournamentId, teamBudget },
        });
    }
    async updateAuctionStatus(auctionId, status) {
        return this.prisma.auction.update({
            where: { id: auctionId },
            data: { status },
        });
    }
    async addPlayerToAuction(auctionId, playerId, basePrice = 50000) {
        return this.prisma.auctionPlayer.create({
            data: { auctionId, playerId, basePrice },
        });
    }
    async approvePlayer(auctionPlayerId) {
        return this.prisma.auctionPlayer.update({
            where: { id: auctionPlayerId },
            data: { status: 'APPROVED' },
        });
    }
    async startBidding(auctionPlayerId) {
        return this.prisma.auctionPlayer.update({
            where: { id: auctionPlayerId },
            data: { status: 'IN_BIDDING' },
        });
    }
    async placeBid(auctionPlayerId, teamId, amount) {
        const auctionPlayer = await this.prisma.auctionPlayer.findUnique({
            where: { id: auctionPlayerId },
            include: { auction: true },
        });
        if (!auctionPlayer)
            throw new common_1.NotFoundException('Player not found in auction');
        const teamWins = await this.prisma.auctionPlayer.findMany({
            where: { auctionId: auctionPlayer.auctionId, soldToTeamId: teamId, status: 'SOLD' },
        });
        const totalSpent = teamWins.reduce((sum, p) => sum + (p.soldPrice || 0), 0);
        const remainingPurse = auctionPlayer.auction.teamBudget - totalSpent;
        if (amount > remainingPurse) {
            throw new common_1.ForbiddenException(`Bid amount exceeds remaining purse (₹${remainingPurse})`);
        }
        return this.prisma.auctionBid.create({
            data: { auctionPlayerId, teamId, amount },
        });
    }
    async sellPlayer(auctionPlayerId, teamId, soldPrice) {
        const auctionPlayer = await this.prisma.auctionPlayer.update({
            where: { id: auctionPlayerId },
            data: { status: 'SOLD', soldToTeamId: teamId, soldPrice },
        });
        await this.prisma.teamPlayer.create({
            data: { playerId: auctionPlayer.playerId, teamId },
        }).catch(() => { });
        return auctionPlayer;
    }
    async markUnsold(auctionPlayerId) {
        return this.prisma.auctionPlayer.update({
            where: { id: auctionPlayerId },
            data: { status: 'UNSOLD' },
        });
    }
};
exports.AuctionsService = AuctionsService;
exports.AuctionsService = AuctionsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], AuctionsService);
//# sourceMappingURL=auctions.service.js.map