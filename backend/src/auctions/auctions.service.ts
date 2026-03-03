import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { NotificationsService } from '../notifications/notifications.service';

@Injectable()
export class AuctionsService {
    private reminders = new Map<string, NodeJS.Timeout>();

    constructor(
        private prisma: PrismaService,
        private notifications: NotificationsService,
    ) { }

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

    // ═══════ SCHEDULE AUCTION & SEND NOTIFICATIONS ═══════

    async scheduleAuction(auctionId: string, scheduledAt: string) {
        const auction = await this.prisma.auction.findUnique({
            where: { id: auctionId },
            include: {
                tournament: {
                    include: {
                        teams: {
                            include: {
                                team: {
                                    include: {
                                        manager: { select: { id: true } },
                                        players: {
                                            include: {
                                                player: {
                                                    include: { user: { select: { id: true } } },
                                                },
                                            },
                                        },
                                    },
                                },
                            },
                        },
                    },
                },
            },
        });

        if (!auction) throw new NotFoundException('Auction not found');

        const scheduledDate = new Date(scheduledAt);

        // Update auction with schedule time
        const updated = await this.prisma.auction.update({
            where: { id: auctionId },
            data: { scheduledAt: scheduledDate },
        });

        // Collect all user IDs to notify (team managers + players)
        const userIds = new Set<string>();
        for (const tt of auction.tournament.teams) {
            // Team manager
            userIds.add(tt.team.manager.id);
            // All players in the team
            for (const tp of tt.team.players) {
                userIds.add(tp.player.user.id);
            }
        }

        const tournamentName = auction.tournament.name;
        const formattedDate = scheduledDate.toLocaleString('en-IN', {
            weekday: 'short', day: 'numeric', month: 'short', year: 'numeric',
            hour: '2-digit', minute: '2-digit', hour12: true,
        });

        //  1) Send immediate notification
        const immediatePromises = Array.from(userIds).map(userId =>
            this.notifications.createNotification({
                userId,
                type: 'AUCTION',
                title: '🔨 Auction Scheduled',
                message: `The auction for "${tournamentName}" has been scheduled for ${formattedDate}. Be ready!`,
                link: '/auction',
            })
        );
        await Promise.all(immediatePromises);

        //  2) Schedule a 12-hour reminder
        const now = Date.now();
        const auctionTime = scheduledDate.getTime();
        const reminderTime = auctionTime - (12 * 60 * 60 * 1000); // 12 hours before

        // Clear any existing reminder for this auction
        if (this.reminders.has(auctionId)) {
            clearTimeout(this.reminders.get(auctionId)!);
        }

        if (reminderTime > now) {
            const delay = reminderTime - now;
            const timeout = setTimeout(async () => {
                try {
                    const reminderPromises = Array.from(userIds).map(userId =>
                        this.notifications.createNotification({
                            userId,
                            type: 'AUCTION',
                            title: '⏰ Auction Reminder — 12 Hours Left',
                            message: `Reminder: The auction for "${tournamentName}" starts in 12 hours (${formattedDate}). Get ready!`,
                            link: '/auction',
                        })
                    );
                    await Promise.all(reminderPromises);
                } catch (e) {
                    console.error('Failed to send auction reminder notifications:', e);
                }
                this.reminders.delete(auctionId);
            }, delay);

            this.reminders.set(auctionId, timeout);
        }

        return updated;
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
