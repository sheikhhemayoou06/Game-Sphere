import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class TournamentsService {
    constructor(private prisma: PrismaService) { }

    async findAll(filters?: { sportId?: string; status?: string; level?: string }) {
        const where: any = {};
        if (filters?.sportId) where.sportId = filters.sportId;
        if (filters?.status) where.status = filters.status;
        if (filters?.level) where.level = filters.level;

        return this.prisma.tournament.findMany({
            where,
            include: {
                sport: true,
                organizer: { select: { id: true, firstName: true, lastName: true, email: true, phone: true } },
                _count: { select: { teams: true, matches: true } },
            },
            orderBy: { createdAt: 'desc' },
        });
    }

    async findOne(id: string) {
        const tournament = await this.prisma.tournament.findUnique({
            where: { id },
            include: {
                sport: true,
                organizer: { select: { id: true, firstName: true, lastName: true, email: true, phone: true } },
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
        if (!tournament) throw new NotFoundException('Tournament not found');
        return tournament;
    }

    async create(userId: string, data: {
        name: string;
        sportId: string;
        description?: string;
        level?: string;
        format?: string;
        maxTeams?: number;
        squadSize?: number;
        registrationFee?: number;
        isRegistrationOpen?: boolean;
        registrationEnd?: string;
        approvalMode?: string;
        maxPurse?: number;
        startDate?: string;
        endDate?: string;
        venue?: string;
        rules?: any;
    }) {
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

    async update(id: string, userId: string, data: any) {
        const tournament = await this.findOne(id);
        if (tournament.organizerId !== userId) {
            throw new ForbiddenException('Only the organizer can update this tournament');
        }
        const updateData = { ...data };
        if (data.startDate) updateData.startDate = new Date(data.startDate);
        if (data.endDate) updateData.endDate = new Date(data.endDate);
        if (data.registrationEnd) updateData.registrationEnd = new Date(data.registrationEnd);
        if (data.rules) updateData.rules = JSON.stringify(data.rules);

        return this.prisma.tournament.update({
            where: { id },
            data: updateData,
            include: { sport: true },
        });
    }

    async updateStatus(id: string, status: string) {
        return this.prisma.tournament.update({
            where: { id },
            data: { status },
        });
    }

    async addTeam(tournamentId: string, teamId: string) {
        return this.prisma.tournamentTeam.create({
            data: { tournamentId, teamId },
            include: { team: true },
        });
    }

    async approveTeam(tournamentId: string, teamId: string) {
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

    async rejectTeam(tournamentId: string, teamId: string) {
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

    async withdrawTeam(tournamentId: string, teamId: string) {
        return this.prisma.tournamentTeam.update({
            where: { tournamentId_teamId: { tournamentId, teamId } },
            data: { status: 'WITHDRAWN' },
        });
    }

    async generateFixtures(tournamentId: string) {
        const tournament = await this.findOne(tournamentId);
        const approvedTeams = tournament.teams.filter(t => t.status === 'APPROVED');

        if (approvedTeams.length < 2) {
            throw new ForbiddenException('Need at least 2 approved teams to generate fixtures');
        }

        const matches: any[] = [];

        if (tournament.format === 'KNOCKOUT') {
            // Simple knockout bracket
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
        } else if (tournament.format === 'ROUND_ROBIN' || tournament.format === 'LEAGUE') {
            // Round-robin: every team plays every other team
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

    async clearAndRegenerateFixtures(tournamentId: string, newFormat?: string) {
        const tournament = await this.findOne(tournamentId);

        // Ensure only unplayed fixtures are deleted
        await this.prisma.match.deleteMany({
            where: {
                tournamentId: tournamentId,
                status: {
                    in: ['SCHEDULED', 'POSTPONED']
                }
            }
        });

        if (newFormat && newFormat !== tournament.format) {
            await this.prisma.tournament.update({
                where: { id: tournamentId },
                data: { format: newFormat }
            });
        }

        return this.generateFixtures(tournamentId);
    }

    async updateMatchDetails(matchId: string, status: string, scoreData?: string, winnerTeamId?: string) {
        return this.prisma.match.update({
            where: { id: matchId },
            data: { status, scoreData, winnerTeamId }
        });
    }

    async getStats(tournamentId: string) {
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

    // ═══════ TEAM MANAGEMENT ═══════



    async getTournamentTeams(tournamentId: string) {
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

    // ═══════ FINANCIALS ═══════

    async getTournamentFinancials(tournamentId: string) {
        // Fetch tournament with registration fee
        const tournament = await this.prisma.tournament.findUnique({
            where: { id: tournamentId },
            select: { id: true, name: true, registrationFee: true },
        });

        // 1) Team registration fees
        const tournamentTeams = await this.prisma.tournamentTeam.findMany({
            where: { tournamentId },
            include: {
                team: { select: { id: true, name: true, logo: true } },
            },
        });

        const registrationFee = tournament?.registrationFee || 0;
        const approvedTeams = tournamentTeams.filter(t => t.status === 'APPROVED');
        const teamFees = approvedTeams.map(t => ({
            teamId: t.teamId,
            teamName: t.team.name,
            teamLogo: t.team.logo,
            status: t.status,
            amount: registrationFee,
            registeredAt: t.registeredAt,
            type: 'TEAM_REGISTRATION' as const,
        }));
        const totalTeamFees = approvedTeams.length * registrationFee;

        // 2) Payment-based registrations (from Registration+Payment models)
        const registrations = await this.prisma.registration.findMany({
            where: { tournamentId },
            include: { payment: true },
        });
        const payments = registrations.filter(r => r.payment).map(r => r.payment!);
        const completedPayments = payments.filter(p => p.status === 'COMPLETED');
        const totalPaymentCollected = completedPayments.reduce((sum, p) => sum + p.amount, 0);
        const pendingPayments = payments.filter(p => p.status === 'PENDING');

        // 3) Auction player registrations
        const auction = await this.prisma.auction.findFirst({
            where: { tournamentId },
            include: {
                players: {
                    include: {
                        player: {
                            include: {
                                user: { select: { firstName: true, lastName: true, avatar: true } },
                            },
                        },
                    },
                },
            },
        });

        const auctionPlayers = auction?.players || [];
        const auctionRegistrations = auctionPlayers.map(ap => ({
            id: ap.id,
            playerName: `${ap.player?.user?.firstName || ''} ${ap.player?.user?.lastName || ''}`.trim(),
            playerAvatar: ap.player?.user?.avatar,
            basePrice: ap.basePrice,
            soldPrice: ap.soldPrice,
            status: ap.status,
            createdAt: ap.createdAt,
            type: 'AUCTION_REGISTRATION' as const,
        }));
        const totalAuctionRegistrationFees = auctionPlayers.length * 5000; // ₹5000 per player auction registration

        // Build combined transactions list
        const allTransactions = [
            ...teamFees.map(tf => ({
                id: tf.teamId,
                desc: `Team Registration — ${tf.teamName}`,
                amount: tf.amount,
                type: 'TEAM_FEE',
                status: 'COMPLETED',
                date: tf.registeredAt,
            })),
            ...completedPayments.map(p => ({
                id: p.id,
                desc: `Registration Payment`,
                amount: p.amount,
                type: 'PAYMENT',
                status: p.status,
                date: p.createdAt,
            })),
            ...auctionRegistrations.map(ar => ({
                id: ar.id,
                desc: `Auction Registration — ${ar.playerName}`,
                amount: 5000,
                type: 'AUCTION_FEE',
                status: ar.status === 'SOLD' || ar.status === 'APPROVED' || ar.status === 'IN_BIDDING' ? 'COMPLETED' : 'PENDING',
                date: ar.createdAt,
            })),
        ].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

        return {
            tournamentName: tournament?.name,
            registrationFee,
            // Team fees
            totalTeams: tournamentTeams.length,
            approvedTeams: approvedTeams.length,
            totalTeamFees,
            teamFees,
            // Payments
            totalRegistrations: registrations.length,
            totalPaymentCollected,
            pendingPaymentsCount: pendingPayments.length,
            pendingPaymentsAmount: pendingPayments.reduce((s, p) => s + p.amount, 0),
            payments: payments.map(p => ({
                id: p.id,
                amount: p.amount,
                status: p.status,
                method: p.paymentMethod,
                createdAt: p.createdAt,
            })),
            // Auction
            hasAuction: !!auction,
            auctionPlayerCount: auctionPlayers.length,
            totalAuctionRegistrationFees,
            auctionRegistrations,
            // Totals
            totalRevenue: totalTeamFees + totalPaymentCollected + totalAuctionRegistrationFees,
            allTransactions,
        };
    }

    // ═══════ LEADERBOARD ═══════

    async getLeaderboard(tournamentId: string) {
        const teams = await this.prisma.tournamentTeam.findMany({
            where: { tournamentId, status: 'APPROVED' },
            include: { team: true },
        });

        const matches = await this.prisma.match.findMany({
            where: { tournamentId, status: 'COMPLETED' },
        });

        // Build points table
        const table = teams.map(tt => {
            const teamId = tt.teamId;
            const teamMatches = matches.filter(m => m.homeTeamId === teamId || m.awayTeamId === teamId);
            const wins = teamMatches.filter(m => m.winnerTeamId === teamId).length;
            const losses = teamMatches.filter(m => (m.status === 'COMPLETED' || m.status === 'ABANDONED') && m.winnerTeamId !== teamId && m.winnerTeamId !== 'DRAW').length;
            // Draw logic: winnerTeamId === 'DRAW' indicates 1 point each
            const draws = teamMatches.filter(m => m.winnerTeamId === 'DRAW').length;

            return {
                teamId,
                teamName: tt.team.name,
                teamLogo: tt.team.logo,
                played: teamMatches.length,
                wins,
                losses,
                draws,
                points: (wins * 2) + draws,
            };
        });

        table.sort((a, b) => b.points - a.points || b.wins - a.wins);
        return table;
    }

    // ═══════ CHAT ═══════

    async getChatMessages(tournamentId: string) {
        return this.prisma.tournamentChat.findMany({
            where: { tournamentId },
            orderBy: { createdAt: 'asc' },
            take: 200,
        });
    }

    async sendChatMessage(tournamentId: string, senderId: string, message: string, type = 'TEXT') {
        return this.prisma.tournamentChat.create({
            data: { tournamentId, senderId, message, type },
        });
    }

    // ═══════ MEDIA ═══════

    async getMedia(tournamentId: string) {
        return this.prisma.tournamentMedia.findMany({
            where: { tournamentId },
            orderBy: { createdAt: 'desc' },
        });
    }

    async addMedia(tournamentId: string, uploadedBy: string, data: { type: string; title: string; description?: string; url: string }) {
        return this.prisma.tournamentMedia.create({
            data: { tournamentId, uploadedBy, ...data },
        });
    }

    // ═══════ BANS ═══════

    async getBannedPlayers(tournamentId: string) {
        return this.prisma.tournamentBan.findMany({
            where: { tournamentId },
            include: { player: { include: { user: { select: { firstName: true, lastName: true, avatar: true } } } } }
        });
    }

    async banPlayer(tournamentId: string, organizerId: string, data: { playerId: string, reason?: string, expiresAt?: string }) {
        const tournament = await this.findOne(tournamentId);
        if (tournament.organizerId !== organizerId) {
            throw new ForbiddenException('Only organizer can ban players');
        }

        return this.prisma.tournamentBan.upsert({
            where: { tournamentId_playerId: { tournamentId, playerId: data.playerId } },
            update: { reason: data.reason, expiresAt: data.expiresAt ? new Date(data.expiresAt) : null, createdBy: organizerId },
            create: {
                tournamentId,
                playerId: data.playerId,
                reason: data.reason,
                expiresAt: data.expiresAt ? new Date(data.expiresAt) : null,
                createdBy: organizerId
            }
        });
    }

    async unbanPlayer(tournamentId: string, organizerId: string, playerId: string) {
        const tournament = await this.findOne(tournamentId);
        if (tournament.organizerId !== organizerId) {
            throw new ForbiddenException('Only organizer can unban players');
        }

        return this.prisma.tournamentBan.delete({
            where: { tournamentId_playerId: { tournamentId, playerId } }
        });
    }
}
