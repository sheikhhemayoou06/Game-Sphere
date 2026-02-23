import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class OwnerDashboardService {
    constructor(private prisma: PrismaService) { }

    async getDashboard(userId: string, sportId: string) {
        // Validate sport exists
        const sport = await this.prisma.sport.findUnique({ where: { id: sportId } });
        if (!sport) throw new NotFoundException('Sport not found');

        // Get teams managed by this user for this sport
        const teams = await this.prisma.team.findMany({
            where: { managerId: userId, sportId },
            include: {
                sport: true,
                players: {
                    include: {
                        player: {
                            include: {
                                user: { select: { id: true, firstName: true, lastName: true, avatar: true } },
                                matchScores: {
                                    where: { match: { sportId } },
                                    include: { match: { select: { id: true, status: true } } },
                                },
                            },
                        },
                    },
                },
                _count: { select: { players: true, tournaments: true } },
            },
        });

        const teamIds = teams.map(t => t.id);

        // Match history for this sport's teams
        const matches = await this.prisma.match.findMany({
            where: {
                sportId,
                OR: [
                    { homeTeamId: { in: teamIds } },
                    { awayTeamId: { in: teamIds } },
                ],
            },
            include: {
                homeTeam: { select: { id: true, name: true } },
                awayTeam: { select: { id: true, name: true } },
                winnerTeam: { select: { id: true, name: true } },
                tournament: { select: { id: true, name: true } },
                sport: true,
            },
            orderBy: { scheduledAt: 'desc' },
            take: 20,
        });

        // Tournaments this sport's teams participate in
        const tournamentTeams = await this.prisma.tournamentTeam.findMany({
            where: { teamId: { in: teamIds } },
            include: {
                tournament: {
                    include: { sport: true },
                },
                team: { select: { id: true, name: true } },
            },
        });
        // Filter to only tournaments for this sport
        const tournaments = tournamentTeams
            .filter(tt => tt.tournament.sportId === sportId)
            .map(tt => ({
                ...tt.tournament,
                teamName: tt.team.name,
                teamId: tt.team.id,
                registrationStatus: tt.status,
            }));

        // Payments related to this sport's tournaments
        const sportTournamentIds = tournaments.map(t => t.id);
        const payments = await this.prisma.payment.findMany({
            where: {
                userId,
                registration: {
                    tournamentId: { in: sportTournamentIds },
                },
            },
            orderBy: { createdAt: 'desc' },
            take: 10,
        });

        // Compute stats
        const completedMatches = matches.filter(m => m.status === 'COMPLETED');
        const wins = completedMatches.filter(m => teamIds.includes(m.winnerTeamId || ''));
        const losses = completedMatches.filter(m => m.winnerTeamId && !teamIds.includes(m.winnerTeamId));
        const upcomingMatches = matches.filter(m => m.status === 'SCHEDULED');
        const liveMatches = matches.filter(m => m.status === 'LIVE');

        const totalPlayers = teams.reduce((sum, t) => sum + t.players.length, 0);

        return {
            sport,
            teams: teams.map(t => ({
                id: t.id,
                name: t.name,
                logo: (t as any).logo,
                playerCount: t.players.length,
                tournamentCount: t._count.tournaments,
            })),
            roster: teams.flatMap(t =>
                t.players.map(tp => ({
                    teamId: t.id,
                    teamName: t.name,
                    playerId: tp.player.id,
                    name: `${tp.player.user.firstName} ${tp.player.user.lastName}`,
                    avatar: tp.player.user.avatar,
                    jersey: tp.jersey,
                    role: tp.role,
                    joinedAt: tp.joinedAt,
                    totalMatches: tp.player.totalMatches,
                    totalWins: tp.player.totalWins,
                    sportMatchCount: tp.player.matchScores.length,
                }))
            ),
            stats: {
                totalPlayers,
                totalTeams: teams.length,
                totalMatches: completedMatches.length,
                wins: wins.length,
                losses: losses.length,
                draws: completedMatches.length - wins.length - losses.length,
                upcomingCount: upcomingMatches.length,
                liveCount: liveMatches.length,
                activeTournaments: tournaments.filter(t => ['REGISTRATION', 'LIVE', 'FIXTURES'].includes(t.status)).length,
            },
            matchHistory: matches.slice(0, 10),
            upcomingFixtures: upcomingMatches.slice(0, 6),
            liveMatches,
            tournaments,
            payments,
        };
    }
}
