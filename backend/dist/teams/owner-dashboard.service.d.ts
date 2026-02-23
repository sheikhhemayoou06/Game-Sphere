import { PrismaService } from '../prisma/prisma.service';
export declare class OwnerDashboardService {
    private prisma;
    constructor(prisma: PrismaService);
    getDashboard(userId: string, sportId: string): Promise<{
        sport: {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            name: string;
            icon: string | null;
            accentColor: string | null;
            teamSize: number;
            maxPlayers: number;
            scoringRules: string | null;
            statFields: string | null;
            matchDuration: string | null;
            pointsSystem: string | null;
            tieBreakerRules: string | null;
            isActive: boolean;
        };
        teams: {
            id: string;
            name: string;
            logo: any;
            playerCount: number;
            tournamentCount: number;
        }[];
        roster: {
            teamId: string;
            teamName: string;
            playerId: string;
            name: string;
            avatar: string | null;
            jersey: number | null;
            role: string | null;
            joinedAt: Date;
            totalMatches: number;
            totalWins: number;
            sportMatchCount: number;
        }[];
        stats: {
            totalPlayers: number;
            totalTeams: number;
            totalMatches: number;
            wins: number;
            losses: number;
            draws: number;
            upcomingCount: number;
            liveCount: number;
            activeTournaments: number;
        };
        matchHistory: ({
            sport: {
                id: string;
                createdAt: Date;
                updatedAt: Date;
                name: string;
                icon: string | null;
                accentColor: string | null;
                teamSize: number;
                maxPlayers: number;
                scoringRules: string | null;
                statFields: string | null;
                matchDuration: string | null;
                pointsSystem: string | null;
                tieBreakerRules: string | null;
                isActive: boolean;
            };
            tournament: {
                id: string;
                name: string;
            };
            homeTeam: {
                id: string;
                name: string;
            } | null;
            awayTeam: {
                id: string;
                name: string;
            } | null;
            winnerTeam: {
                id: string;
                name: string;
            } | null;
        } & {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            sportId: string;
            status: string;
            venue: string | null;
            matchNumber: number | null;
            tournamentId: string;
            homeTeamId: string | null;
            awayTeamId: string | null;
            winnerTeamId: string | null;
            round: string | null;
            scheduledAt: Date | null;
            scoreData: string | null;
            matchReport: string | null;
        })[];
        upcomingFixtures: ({
            sport: {
                id: string;
                createdAt: Date;
                updatedAt: Date;
                name: string;
                icon: string | null;
                accentColor: string | null;
                teamSize: number;
                maxPlayers: number;
                scoringRules: string | null;
                statFields: string | null;
                matchDuration: string | null;
                pointsSystem: string | null;
                tieBreakerRules: string | null;
                isActive: boolean;
            };
            tournament: {
                id: string;
                name: string;
            };
            homeTeam: {
                id: string;
                name: string;
            } | null;
            awayTeam: {
                id: string;
                name: string;
            } | null;
            winnerTeam: {
                id: string;
                name: string;
            } | null;
        } & {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            sportId: string;
            status: string;
            venue: string | null;
            matchNumber: number | null;
            tournamentId: string;
            homeTeamId: string | null;
            awayTeamId: string | null;
            winnerTeamId: string | null;
            round: string | null;
            scheduledAt: Date | null;
            scoreData: string | null;
            matchReport: string | null;
        })[];
        liveMatches: ({
            sport: {
                id: string;
                createdAt: Date;
                updatedAt: Date;
                name: string;
                icon: string | null;
                accentColor: string | null;
                teamSize: number;
                maxPlayers: number;
                scoringRules: string | null;
                statFields: string | null;
                matchDuration: string | null;
                pointsSystem: string | null;
                tieBreakerRules: string | null;
                isActive: boolean;
            };
            tournament: {
                id: string;
                name: string;
            };
            homeTeam: {
                id: string;
                name: string;
            } | null;
            awayTeam: {
                id: string;
                name: string;
            } | null;
            winnerTeam: {
                id: string;
                name: string;
            } | null;
        } & {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            sportId: string;
            status: string;
            venue: string | null;
            matchNumber: number | null;
            tournamentId: string;
            homeTeamId: string | null;
            awayTeamId: string | null;
            winnerTeamId: string | null;
            round: string | null;
            scheduledAt: Date | null;
            scoreData: string | null;
            matchReport: string | null;
        })[];
        tournaments: {
            teamName: string;
            teamId: string;
            registrationStatus: string;
            sport: {
                id: string;
                createdAt: Date;
                updatedAt: Date;
                name: string;
                icon: string | null;
                accentColor: string | null;
                teamSize: number;
                maxPlayers: number;
                scoringRules: string | null;
                statFields: string | null;
                matchDuration: string | null;
                pointsSystem: string | null;
                tieBreakerRules: string | null;
                isActive: boolean;
            };
            id: string;
            createdAt: Date;
            updatedAt: Date;
            name: string;
            sportId: string;
            status: string;
            level: string;
            organizerId: string;
            description: string | null;
            format: string;
            maxTeams: number;
            squadSize: number;
            registrationFee: number;
            prizePool: number;
            isRegistrationOpen: boolean;
            registrationEnd: Date | null;
            approvalMode: string;
            maxPurse: number;
            startDate: Date | null;
            endDate: Date | null;
            venue: string | null;
            rules: string | null;
            bannerUrl: string | null;
        }[];
        payments: {
            id: string;
            createdAt: Date;
            userId: string;
            status: string;
            registrationId: string | null;
            amount: number;
            currency: string;
            paymentMethod: string | null;
            transactionId: string | null;
        }[];
    }>;
}
