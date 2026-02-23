import { TeamsService } from './teams.service';
import { OwnerDashboardService } from './owner-dashboard.service';
export declare class TeamsController {
    private teamsService;
    private ownerDashboardService;
    constructor(teamsService: TeamsService, ownerDashboardService: OwnerDashboardService);
    findAll(): Promise<({
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
        _count: {
            tournaments: number;
            players: number;
        };
        manager: {
            id: string;
            firstName: string;
            lastName: string;
        };
    } & {
        id: string;
        createdAt: Date;
        updatedAt: Date;
        name: string;
        city: string | null;
        state: string | null;
        sportId: string;
        managerId: string;
        logo: string | null;
    })[]>;
    getMySports(req: any): Promise<{
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
    }[]>;
    getMyTeams(req: any, sportId?: string): Promise<({
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
        _count: {
            tournaments: number;
            players: number;
        };
    } & {
        id: string;
        createdAt: Date;
        updatedAt: Date;
        name: string;
        city: string | null;
        state: string | null;
        sportId: string;
        managerId: string;
        logo: string | null;
    })[]>;
    getOwnerDashboard(req: any, sportId: string): Promise<{
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
            registrationFee: number;
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
    findOne(id: string): Promise<{
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
        tournaments: ({
            tournament: {
                id: string;
                name: string;
                status: string;
            };
        } & {
            id: string;
            seed: number | null;
            status: string;
            registeredAt: Date;
            tournamentId: string;
            teamId: string;
        })[];
        manager: {
            id: string;
            email: string;
            firstName: string;
            lastName: string;
        };
        players: ({
            player: {
                user: {
                    id: string;
                    firstName: string;
                    lastName: string;
                    avatar: string | null;
                };
            } & {
                id: string;
                createdAt: Date;
                updatedAt: Date;
                sportsId: string;
                dateOfBirth: Date | null;
                gender: string | null;
                city: string | null;
                state: string | null;
                country: string;
                primarySport: string | null;
                bio: string | null;
                totalMatches: number;
                totalWins: number;
                careerStats: string | null;
                userId: string;
            };
        } & {
            id: string;
            role: string | null;
            teamId: string;
            playerId: string;
            jersey: number | null;
            joinedAt: Date;
        })[];
    } & {
        id: string;
        createdAt: Date;
        updatedAt: Date;
        name: string;
        city: string | null;
        state: string | null;
        sportId: string;
        managerId: string;
        logo: string | null;
    }>;
    create(req: any, data: any): Promise<{
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
        manager: {
            id: string;
            firstName: string;
            lastName: string;
        };
    } & {
        id: string;
        createdAt: Date;
        updatedAt: Date;
        name: string;
        city: string | null;
        state: string | null;
        sportId: string;
        managerId: string;
        logo: string | null;
    }>;
    update(id: string, req: any, data: any): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        name: string;
        city: string | null;
        state: string | null;
        sportId: string;
        managerId: string;
        logo: string | null;
    }>;
    addPlayer(teamId: string, data: {
        playerId: string;
        jersey?: number;
        role?: string;
    }): Promise<{
        player: {
            user: {
                firstName: string;
                lastName: string;
            };
        } & {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            sportsId: string;
            dateOfBirth: Date | null;
            gender: string | null;
            city: string | null;
            state: string | null;
            country: string;
            primarySport: string | null;
            bio: string | null;
            totalMatches: number;
            totalWins: number;
            careerStats: string | null;
            userId: string;
        };
    } & {
        id: string;
        role: string | null;
        teamId: string;
        playerId: string;
        jersey: number | null;
        joinedAt: Date;
    }>;
    removePlayer(teamId: string, playerId: string): Promise<{
        id: string;
        role: string | null;
        teamId: string;
        playerId: string;
        jersey: number | null;
        joinedAt: Date;
    }>;
}
