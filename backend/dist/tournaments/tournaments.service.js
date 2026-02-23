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
exports.TournamentsService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
let TournamentsService = class TournamentsService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async findAll(filters) {
        const where = {};
        if (filters?.sportId)
            where.sportId = filters.sportId;
        if (filters?.status)
            where.status = filters.status;
        if (filters?.level)
            where.level = filters.level;
        return this.prisma.tournament.findMany({
            where,
            include: {
                sport: true,
                organizer: { select: { id: true, firstName: true, lastName: true, email: true } },
                _count: { select: { teams: true, matches: true } },
            },
            orderBy: { createdAt: 'desc' },
        });
    }
    async findOne(id) {
        const tournament = await this.prisma.tournament.findUnique({
            where: { id },
            include: {
                sport: true,
                organizer: { select: { id: true, firstName: true, lastName: true, email: true } },
                teams: {
                    include: {
                        team: {
                            include: {
                                players: { include: { player: { include: { user: { select: { firstName: true, lastName: true } } } } } },
                            },
                        },
                    },
                },
                matches: {
                    include: {
                        homeTeam: true,
                        awayTeam: true,
                        winnerTeam: true,
                    },
                    orderBy: { matchNumber: 'asc' },
                },
            },
        });
        if (!tournament)
            throw new common_1.NotFoundException('Tournament not found');
        return tournament;
    }
    async create(userId, data) {
        return this.prisma.tournament.create({
            data: {
                ...data,
                organizerId: userId,
                startDate: data.startDate ? new Date(data.startDate) : null,
                endDate: data.endDate ? new Date(data.endDate) : null,
                registrationEnd: data.registrationEnd ? new Date(data.registrationEnd) : null,
                rules: data.rules ? JSON.stringify(data.rules) : null,
            },
            include: { sport: true },
        });
    }
    async update(id, userId, data) {
        const tournament = await this.findOne(id);
        if (tournament.organizerId !== userId) {
            throw new common_1.ForbiddenException('Only the organizer can update this tournament');
        }
        const updateData = { ...data };
        if (data.startDate)
            updateData.startDate = new Date(data.startDate);
        if (data.endDate)
            updateData.endDate = new Date(data.endDate);
        if (data.registrationEnd)
            updateData.registrationEnd = new Date(data.registrationEnd);
        if (data.rules)
            updateData.rules = JSON.stringify(data.rules);
        return this.prisma.tournament.update({
            where: { id },
            data: updateData,
            include: { sport: true },
        });
    }
    async updateStatus(id, status) {
        return this.prisma.tournament.update({
            where: { id },
            data: { status },
        });
    }
    async addTeam(tournamentId, teamId) {
        return this.prisma.tournamentTeam.create({
            data: { tournamentId, teamId },
            include: { team: true },
        });
    }
    async approveTeam(tournamentId, teamId) {
        const team = await this.prisma.team.findUnique({ where: { id: teamId } });
        const tourney = await this.prisma.tournament.findUnique({ where: { id: tournamentId } });
        if (team && tourney) {
            await this.prisma.notification.create({
                data: {
                    userId: team.managerId,
                    type: 'TOURNAMENT',
                    title: 'Registration Approved',
                    message: `Your team ${team.name} has been approved for ${tourney.name}.`,
                    link: `/tournaments/${tournamentId}`
                }
            });
        }
        return this.prisma.tournamentTeam.update({
            where: { tournamentId_teamId: { tournamentId, teamId } },
            data: { status: 'APPROVED' },
        });
    }
    async rejectTeam(tournamentId, teamId) {
        const team = await this.prisma.team.findUnique({ where: { id: teamId } });
        const tourney = await this.prisma.tournament.findUnique({ where: { id: tournamentId } });
        if (team && tourney) {
            await this.prisma.notification.create({
                data: {
                    userId: team.managerId,
                    type: 'TOURNAMENT',
                    title: 'Registration Rejected',
                    message: `Your team ${team.name}'s registration for ${tourney.name} was rejected.`,
                }
            });
        }
        return this.prisma.tournamentTeam.update({
            where: { tournamentId_teamId: { tournamentId, teamId } },
            data: { status: 'REJECTED' },
        });
    }
    async withdrawTeam(tournamentId, teamId) {
        return this.prisma.tournamentTeam.update({
            where: { tournamentId_teamId: { tournamentId, teamId } },
            data: { status: 'WITHDRAWN' },
        });
    }
    async generateFixtures(tournamentId) {
        const tournament = await this.findOne(tournamentId);
        const approvedTeams = tournament.teams.filter(t => t.status === 'APPROVED');
        if (approvedTeams.length < 2) {
            throw new common_1.ForbiddenException('Need at least 2 approved teams to generate fixtures');
        }
        const matches = [];
        if (tournament.format === 'KNOCKOUT') {
            for (let i = 0; i < approvedTeams.length; i += 2) {
                if (approvedTeams[i + 1]) {
                    matches.push({
                        tournamentId,
                        sportId: tournament.sportId,
                        homeTeamId: approvedTeams[i].teamId,
                        awayTeamId: approvedTeams[i + 1].teamId,
                        round: `Round 1`,
                        matchNumber: Math.floor(i / 2) + 1,
                        status: 'SCHEDULED',
                    });
                }
            }
        }
        else if (tournament.format === 'ROUND_ROBIN' || tournament.format === 'LEAGUE') {
            let matchNum = 1;
            for (let i = 0; i < approvedTeams.length; i++) {
                for (let j = i + 1; j < approvedTeams.length; j++) {
                    matches.push({
                        tournamentId,
                        sportId: tournament.sportId,
                        homeTeamId: approvedTeams[i].teamId,
                        awayTeamId: approvedTeams[j].teamId,
                        round: `Matchday ${matchNum}`,
                        matchNumber: matchNum,
                        status: 'SCHEDULED',
                    });
                    matchNum++;
                }
            }
        }
        if (matches.length > 0) {
            await this.prisma.match.createMany({ data: matches });
            await this.updateStatus(tournamentId, 'FIXTURES');
        }
        return this.findOne(tournamentId);
    }
    async getStats(tournamentId) {
        const tournament = await this.findOne(tournamentId);
        const totalMatches = tournament.matches.length;
        const completedMatches = tournament.matches.filter(m => m.status === 'COMPLETED').length;
        const liveMatches = tournament.matches.filter(m => m.status === 'LIVE').length;
        return {
            totalTeams: tournament.teams.length,
            approvedTeams: tournament.teams.filter(t => t.status === 'APPROVED').length,
            totalMatches,
            completedMatches,
            liveMatches,
            upcomingMatches: totalMatches - completedMatches - liveMatches,
        };
    }
    async getTournamentTeams(tournamentId) {
        return this.prisma.tournamentTeam.findMany({
            where: { tournamentId },
            include: {
                team: {
                    include: {
                        players: {
                            include: {
                                player: {
                                    include: {
                                        user: { select: { firstName: true, lastName: true, email: true, avatar: true } },
                                    },
                                },
                            },
                        },
                        manager: { select: { id: true, firstName: true, lastName: true, email: true } },
                    },
                },
            },
            orderBy: { registeredAt: 'desc' },
        });
    }
    async getTournamentFinancials(tournamentId) {
        const registrations = await this.prisma.registration.findMany({
            where: { tournamentId },
            include: { payment: true },
        });
        const payments = registrations.filter(r => r.payment).map(r => r.payment);
        const totalCollected = payments.filter(p => p.status === 'COMPLETED').reduce((sum, p) => sum + p.amount, 0);
        const pendingPayments = payments.filter(p => p.status === 'PENDING').length;
        return {
            totalRegistrations: registrations.length,
            totalCollected,
            pendingPayments,
            payments: payments.map(p => ({
                id: p.id,
                amount: p.amount,
                status: p.status,
                method: p.paymentMethod,
                createdAt: p.createdAt,
            })),
        };
    }
    async getLeaderboard(tournamentId) {
        const teams = await this.prisma.tournamentTeam.findMany({
            where: { tournamentId, status: 'APPROVED' },
            include: { team: true },
        });
        const matches = await this.prisma.match.findMany({
            where: { tournamentId, status: 'COMPLETED' },
        });
        const table = teams.map(tt => {
            const teamId = tt.teamId;
            const teamMatches = matches.filter(m => m.homeTeamId === teamId || m.awayTeamId === teamId);
            const wins = teamMatches.filter(m => m.winnerTeamId === teamId).length;
            const losses = teamMatches.filter(m => m.winnerTeamId && m.winnerTeamId !== teamId).length;
            const draws = teamMatches.filter(m => !m.winnerTeamId).length;
            return {
                teamId,
                teamName: tt.team.name,
                teamLogo: tt.team.logo,
                played: teamMatches.length,
                wins,
                losses,
                draws,
                points: wins * 2 + draws,
            };
        });
        table.sort((a, b) => b.points - a.points || b.wins - a.wins);
        return table;
    }
    async getChatMessages(tournamentId) {
        return this.prisma.tournamentChat.findMany({
            where: { tournamentId },
            orderBy: { createdAt: 'asc' },
            take: 200,
        });
    }
    async sendChatMessage(tournamentId, senderId, message, type = 'TEXT') {
        return this.prisma.tournamentChat.create({
            data: { tournamentId, senderId, message, type },
        });
    }
    async getMedia(tournamentId) {
        return this.prisma.tournamentMedia.findMany({
            where: { tournamentId },
            orderBy: { createdAt: 'desc' },
        });
    }
    async addMedia(tournamentId, uploadedBy, data) {
        return this.prisma.tournamentMedia.create({
            data: { tournamentId, uploadedBy, ...data },
        });
    }
};
exports.TournamentsService = TournamentsService;
exports.TournamentsService = TournamentsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], TournamentsService);
//# sourceMappingURL=tournaments.service.js.map