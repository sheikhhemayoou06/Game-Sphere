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
exports.MatchesService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
let MatchesService = class MatchesService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async findAll(filters) {
        const where = {};
        if (filters?.tournamentId)
            where.tournamentId = filters.tournamentId;
        if (filters?.status)
            where.status = filters.status;
        if (filters?.sportId)
            where.sportId = filters.sportId;
        return this.prisma.match.findMany({
            where,
            include: {
                homeTeam: true,
                awayTeam: true,
                winnerTeam: true,
                sport: true,
                tournament: { select: { id: true, name: true } },
            },
            orderBy: { matchNumber: 'asc' },
        });
    }
    async findOne(id) {
        const match = await this.prisma.match.findUnique({
            where: { id },
            include: {
                homeTeam: true,
                awayTeam: true,
                winnerTeam: true,
                sport: true,
                tournament: { select: { id: true, name: true, format: true } },
                playerStats: {
                    include: {
                        player: {
                            include: { user: { select: { firstName: true, lastName: true } } },
                        },
                    },
                },
            },
        });
        if (!match)
            throw new common_1.NotFoundException('Match not found');
        return match;
    }
    async updateScore(id, scoreData) {
        return this.prisma.match.update({
            where: { id },
            data: {
                scoreData: JSON.stringify(scoreData),
                status: 'LIVE',
            },
            include: {
                homeTeam: true,
                awayTeam: true,
                sport: true,
            },
        });
    }
    async completeMatch(id, data) {
        return this.prisma.match.update({
            where: { id },
            data: {
                winnerTeamId: data.winnerTeamId,
                scoreData: JSON.stringify(data.scoreData),
                matchReport: data.matchReport,
                status: 'COMPLETED',
            },
            include: {
                homeTeam: true,
                awayTeam: true,
                winnerTeam: true,
                sport: true,
            },
        });
    }
    async updatePlayerStats(matchId, playerId, statsData) {
        return this.prisma.matchPlayerStat.upsert({
            where: { matchId_playerId: { matchId, playerId } },
            update: { statsData: JSON.stringify(statsData) },
            create: {
                matchId,
                playerId,
                statsData: JSON.stringify(statsData),
            },
        });
    }
    async getLiveMatches() {
        return this.prisma.match.findMany({
            where: { status: 'LIVE' },
            include: {
                homeTeam: true,
                awayTeam: true,
                sport: true,
                tournament: { select: { id: true, name: true } },
            },
        });
    }
    async getUpcomingMatches() {
        return this.prisma.match.findMany({
            where: { status: 'SCHEDULED' },
            include: {
                homeTeam: true,
                awayTeam: true,
                sport: true,
                tournament: { select: { id: true, name: true } },
            },
            orderBy: { scheduledAt: 'asc' },
            take: 20,
        });
    }
};
exports.MatchesService = MatchesService;
exports.MatchesService = MatchesService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], MatchesService);
//# sourceMappingURL=matches.service.js.map