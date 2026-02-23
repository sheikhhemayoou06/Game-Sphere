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
exports.RankingsService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
let RankingsService = class RankingsService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async getLeaderboard(sportId, level) {
        const where = {};
        if (sportId)
            where.sportId = sportId;
        if (level)
            where.level = level;
        return this.prisma.ranking.findMany({
            where,
            orderBy: [{ points: 'desc' }, { wins: 'desc' }],
            take: 100,
        });
    }
    async getPlayerRankings(playerId) {
        return this.prisma.ranking.findMany({
            where: { playerId },
            orderBy: { points: 'desc' },
        });
    }
    async getTeamRankings(teamId) {
        return this.prisma.ranking.findMany({
            where: { teamId },
            orderBy: { points: 'desc' },
        });
    }
    async upsertRanking(data) {
        const existing = await this.prisma.ranking.findFirst({
            where: {
                playerId: data.playerId,
                sportId: data.sportId,
                level: data.level || 'DISTRICT',
                season: data.season || '2026',
            },
        });
        if (existing) {
            return this.prisma.ranking.update({
                where: { id: existing.id },
                data: {
                    points: (existing.points || 0) + (data.points || 0),
                    wins: (existing.wins || 0) + (data.wins || 0),
                    losses: (existing.losses || 0) + (data.losses || 0),
                    draws: (existing.draws || 0) + (data.draws || 0),
                    matchesPlayed: (existing.matchesPlayed || 0) + (data.matchesPlayed || 0),
                    previousRank: existing.rank,
                },
            });
        }
        return this.prisma.ranking.create({
            data: {
                playerId: data.playerId,
                teamId: data.teamId,
                sportId: data.sportId,
                level: data.level || 'DISTRICT',
                season: data.season || '2026',
                points: data.points || 0,
                wins: data.wins || 0,
                losses: data.losses || 0,
                draws: data.draws || 0,
                matchesPlayed: data.matchesPlayed || 0,
            },
        });
    }
    async recalculateRanks(sportId, level) {
        const rankings = await this.prisma.ranking.findMany({
            where: { sportId, level },
            orderBy: [{ points: 'desc' }, { wins: 'desc' }],
        });
        for (let i = 0; i < rankings.length; i++) {
            await this.prisma.ranking.update({
                where: { id: rankings[i].id },
                data: { previousRank: rankings[i].rank, rank: i + 1 },
            });
        }
        return { updated: rankings.length };
    }
};
exports.RankingsService = RankingsService;
exports.RankingsService = RankingsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], RankingsService);
//# sourceMappingURL=rankings.service.js.map