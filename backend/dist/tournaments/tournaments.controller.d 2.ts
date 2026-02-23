import { TournamentsService } from './tournaments.service';
export declare class TournamentsController {
    private tournamentsService;
    constructor(tournamentsService: TournamentsService);
    findAll(sportId?: string, status?: string, level?: string): Promise<({
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
            matches: number;
            teams: number;
        };
        organizer: {
            id: string;
            email: string;
            firstName: string;
            lastName: string;
        };
    } & {
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
    })[]>;
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
        matches: ({
            homeTeam: {
                id: string;
                createdAt: Date;
                updatedAt: Date;
                name: string;
                city: string | null;
                state: string | null;
                sportId: string;
                managerId: string;
                logo: string | null;
            } | null;
            awayTeam: {
                id: string;
                createdAt: Date;
                updatedAt: Date;
                name: string;
                city: string | null;
                state: string | null;
                sportId: string;
                managerId: string;
                logo: string | null;
            } | null;
            winnerTeam: {
                id: string;
                createdAt: Date;
                updatedAt: Date;
                name: string;
                city: string | null;
                state: string | null;
                sportId: string;
                managerId: string;
                logo: string | null;
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
        teams: ({
            team: {
                players: ({
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
            };
        } & {
            id: string;
            seed: number | null;
            status: string;
            registeredAt: Date;
            tournamentId: string;
            teamId: string;
        })[];
        organizer: {
            id: string;
            email: string;
            firstName: string;
            lastName: string;
        };
    } & {
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
    }>;
    getStats(id: string): Promise<{
        totalTeams: number;
        approvedTeams: number;
        totalMatches: number;
        completedMatches: number;
        liveMatches: number;
        upcomingMatches: number;
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
    } & {
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
    }>;
    update(id: string, req: any, data: any): Promise<{
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
    } & {
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
    }>;
    updateStatus(id: string, status: string): Promise<{
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
    }>;
    addTeam(id: string, teamId: string): Promise<{
        team: {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            name: string;
            city: string | null;
            state: string | null;
            sportId: string;
            managerId: string;
            logo: string | null;
        };
    } & {
        id: string;
        seed: number | null;
        status: string;
        registeredAt: Date;
        tournamentId: string;
        teamId: string;
    }>;
    approveTeam(id: string, teamId: string): Promise<{
        id: string;
        seed: number | null;
        status: string;
        registeredAt: Date;
        tournamentId: string;
        teamId: string;
    }>;
    generateFixtures(id: string): Promise<{
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
        matches: ({
            homeTeam: {
                id: string;
                createdAt: Date;
                updatedAt: Date;
                name: string;
                city: string | null;
                state: string | null;
                sportId: string;
                managerId: string;
                logo: string | null;
            } | null;
            awayTeam: {
                id: string;
                createdAt: Date;
                updatedAt: Date;
                name: string;
                city: string | null;
                state: string | null;
                sportId: string;
                managerId: string;
                logo: string | null;
            } | null;
            winnerTeam: {
                id: string;
                createdAt: Date;
                updatedAt: Date;
                name: string;
                city: string | null;
                state: string | null;
                sportId: string;
                managerId: string;
                logo: string | null;
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
        teams: ({
            team: {
                players: ({
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
            };
        } & {
            id: string;
            seed: number | null;
            status: string;
            registeredAt: Date;
            tournamentId: string;
            teamId: string;
        })[];
        organizer: {
            id: string;
            email: string;
            firstName: string;
            lastName: string;
        };
    } & {
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
    }>;
}
