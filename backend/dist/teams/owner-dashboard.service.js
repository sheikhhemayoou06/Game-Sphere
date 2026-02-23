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
exports.OwnerDashboardService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
let OwnerDashboardService = class OwnerDashboardService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async getDashboard(userId, sportId) {
        const sport = await this.prisma.sport.findUnique({ where: { id: sportId } });
        if (!sport)
            throw new common_1.NotFoundException('Sport not found');
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
        const tournamentTeams = await this.prisma.tournamentTeam.findMany({
            where: { teamId: { in: teamIds } },
            include: {
                tournament: {
                    include: { sport: true },
                },
                team: { select: { id: true, name: true } },
            },
        });
        const tournaments = tournamentTeams
            .filter(tt => tt.tournament.sportId === sportId)
            .map(tt => ({
            ...tt.tournament,
            teamName: tt.team.name,
            teamId: tt.team.id,
            registrationStatus: tt.status,
        }));
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
                logo: t.logo,
                playerCount: t.players.length,
                tournamentCount: t._count.tournaments,
            })),
            roster: teams.flatMap(t => t.players.map(tp => ({
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
            }))),
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
};
exports.OwnerDashboardService = OwnerDashboardService;
exports.OwnerDashboardService = OwnerDashboardService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], OwnerDashboardService);
//# sourceMappingURL=owner-dashboard.service.js.map