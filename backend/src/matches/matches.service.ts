import { Injectable, NotFoundException, BadRequestException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class MatchesService {
    constructor(private prisma: PrismaService) { }

    async findAll(filters?: { tournamentId?: string; status?: string; sportId?: string }) {
        const where: any = {};
        if (filters?.tournamentId) where.tournamentId = filters.tournamentId;
        if (filters?.status) where.status = filters.status;
        if (filters?.sportId) where.sportId = filters.sportId;

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

    async findOne(id: string) {
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
        if (!match) throw new NotFoundException('Match not found');
        return match;
    }

    private async verifyOrganizer(matchId: string, userId: string) {
        const match = await this.prisma.match.findUnique({
            where: { id: matchId },
            include: { tournament: { select: { organizerId: true } } },
        });
        if (!match) throw new NotFoundException('Match not found');
        if (match.tournament.organizerId !== userId) {
            throw new ForbiddenException('Only the tournament organizer can update scores');
        }
        return match;
    }

    async updateScore(id: string, scoreData: any, userId: string) {
        await this.verifyOrganizer(id, userId);
        const match = await this.prisma.match.findUnique({ where: { id } });
        if (!match) throw new NotFoundException('Match not found');

        if (match.status === 'SCHEDULED' && match.scheduledAt) {
            if (new Date() < new Date(match.scheduledAt)) {
                throw new BadRequestException('Cannot start scoring before the scheduled time');
            }
        }

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

    async completeMatch(id: string, data: { winnerTeamId: string; scoreData: any; matchReport?: string }, userId: string) {
        await this.verifyOrganizer(id, userId);
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

    async updatePlayerStats(matchId: string, playerId: string, statsData: any) {
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
}
