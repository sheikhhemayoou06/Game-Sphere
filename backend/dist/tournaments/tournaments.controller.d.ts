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
        organizerId: string;
        description: string | null;
        level: string;
        format: string;
        status: string;
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
            tournamentId: string;
            teamId: string;
            registeredAt: Date;
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
        organizerId: string;
        description: string | null;
        level: string;
        format: string;
        status: string;
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
        organizerId: string;
        description: string | null;
        level: string;
        format: string;
        status: string;
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
        organizerId: string;
        description: string | null;
        level: string;
        format: string;
        status: string;
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
    }>;
    updateStatus(id: string, status: string): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        name: string;
        sportId: string;
        organizerId: string;
        description: string | null;
        level: string;
        format: string;
        status: string;
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
        tournamentId: string;
        teamId: string;
        registeredAt: Date;
    }>;
    approveTeam(id: string, teamId: string): Promise<{
        id: string;
        seed: number | null;
        status: string;
        tournamentId: string;
        teamId: string;
        registeredAt: Date;
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
            tournamentId: string;
            teamId: string;
            registeredAt: Date;
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
        organizerId: string;
        description: string | null;
        level: string;
        format: string;
        status: string;
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
    }>;
    getTournamentTeams(id: string): Promise<({
        team: {
            manager: {
                id: string;
                email: string;
                firstName: string;
                lastName: string;
            };
            players: ({
                player: {
                    user: {
                        email: string;
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
        };
    } & {
        id: string;
        seed: number | null;
        status: string;
        tournamentId: string;
        teamId: string;
        registeredAt: Date;
    })[]>;
    withdrawTeam(id: string, teamId: string): Promise<{
        id: string;
        seed: number | null;
        status: string;
        tournamentId: string;
        teamId: string;
        registeredAt: Date;
    }>;
    rejectTeam(id: string, teamId: string): Promise<{
        id: string;
        seed: number | null;
        status: string;
        tournamentId: string;
        teamId: string;
        registeredAt: Date;
    }>;
    getFinancials(id: string): Promise<{
        totalRegistrations: number;
        totalCollected: number;
        pendingPayments: number;
        payments: {
            id: string;
            amount: number;
            status: string;
            method: string | null;
            createdAt: Date;
        }[];
    }>;
    getLeaderboard(id: string): Promise<{
        teamId: string;
        teamName: string;
        teamLogo: string | null;
        played: number;
        wins: number;
        losses: number;
        draws: number;
        points: number;
    }[]>;
    getChatMessages(id: string): Promise<{
        id: string;
        createdAt: Date;
        tournamentId: string;
        senderId: string;
        message: string;
        type: string;
    }[]>;
    sendChatMessage(id: string, req: any, body: {
        message: string;
        type?: string;
    }): Promise<{
        id: string;
        createdAt: Date;
        tournamentId: string;
        senderId: string;
        message: string;
        type: string;
    }>;
    getMedia(id: string): Promise<{
        id: string;
        createdAt: Date;
        description: string | null;
        tournamentId: string;
        type: string;
        uploadedBy: string;
        title: string;
        url: string;
    }[]>;
    addMedia(id: string, req: any, body: any): Promise<{
        id: string;
        createdAt: Date;
        description: string | null;
        tournamentId: string;
        type: string;
        uploadedBy: string;
        title: string;
        url: string;
    }>;
}
