import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class RankingsService {
    constructor(private prisma: PrismaService) { }

    async getLeaderboard(sportId?: string, level?: string) {
        const where: any = {};
        if (sportId) where.sportId = sportId;
        if (level) where.level = level;

        return this.prisma.ranking.findMany({
            where,
            orderBy: [{ points: 'desc' }, { wins: 'desc' }],
            take: 100,
        });
    }

    async getPlayerRankings(playerId: string) {
        return this.prisma.ranking.findMany({
            where: { playerId },
            orderBy: { points: 'desc' },
        });
    }

    async getTeamRankings(teamId: string) {
        return this.prisma.ranking.findMany({
            where: { teamId },
            orderBy: { points: 'desc' },
        });
    }

    async upsertRanking(data: {
        playerId?: string;
        teamId?: string;
        sportId: string;
        level?: string;
        season?: string;
        points?: number;
        wins?: number;
        losses?: number;
        draws?: number;
        matchesPlayed?: number;
    }) {
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

    async recalculateRanks(sportId: string, level: string) {
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
}
