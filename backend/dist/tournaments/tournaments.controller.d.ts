import { TournamentsService } from './tournaments.service';
export declare class TournamentsController {
    private tournamentsService;
    constructor(tournamentsService: TournamentsService);
    findAll(sportId?: string, status?: string, level?: string): Promise<({
        sport: {
            id: string;
            name: string;
            createdAt: Date;
            updatedAt: Date;
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
        organizer: {
            id: string;
            email: string;
            firstName: string;
            lastName: string;
        };
        _count: {
            teams: number;
            matches: number;
        };
    } & {
        id: string;
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
        createdAt: Date;
        updatedAt: Date;
    })[]>;
    findOne(id: string): Promise<{
        sport: {
            id: string;
            name: string;
            createdAt: Date;
            updatedAt: Date;
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
        organizer: {
            id: string;
            email: string;
            firstName: string;
            lastName: string;
        };
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
                        city: string | null;
                        state: string | null;
                        sportsId: string;
                        userId: string;
                        dateOfBirth: Date | null;
                        gender: string | null;
                        country: string;
                        primarySport: string | null;
                        bio: string | null;
                        totalMatches: number;
                        totalWins: number;
                        careerStats: string | null;
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
                name: string;
                sportId: string;
                createdAt: Date;
                updatedAt: Date;
                managerId: string;
                logo: string | null;
                city: string | null;
                state: string | null;
            };
        } & {
            id: string;
            status: string;
            tournamentId: string;
            teamId: string;
            seed: number | null;
            registeredAt: Date;
        })[];
        matches: ({
            homeTeam: {
                id: string;
                name: string;
                sportId: string;
                createdAt: Date;
                updatedAt: Date;
                managerId: string;
                logo: string | null;
                city: string | null;
                state: string | null;
            } | null;
            awayTeam: {
                id: string;
                name: string;
                sportId: string;
                createdAt: Date;
                updatedAt: Date;
                managerId: string;
                logo: string | null;
                city: string | null;
                state: string | null;
            } | null;
            winnerTeam: {
                id: string;
                name: string;
                sportId: string;
                createdAt: Date;
                updatedAt: Date;
                managerId: string;
                logo: string | null;
                city: string | null;
                state: string | null;
            } | null;
        } & {
            id: string;
            sportId: string;
            status: string;
            venue: string | null;
            createdAt: Date;
            updatedAt: Date;
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
    } & {
        id: string;
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
        createdAt: Date;
        updatedAt: Date;
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
            name: string;
            createdAt: Date;
            updatedAt: Date;
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
        createdAt: Date;
        updatedAt: Date;
    }>;
    update(id: string, req: any, data: any): Promise<{
        sport: {
            id: string;
            name: string;
            createdAt: Date;
            updatedAt: Date;
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
        createdAt: Date;
        updatedAt: Date;
    }>;
    updateStatus(id: string, status: string): Promise<{
        id: string;
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
        createdAt: Date;
        updatedAt: Date;
    }>;
    addTeam(id: string, teamId: string): Promise<{
        team: {
            id: string;
            name: string;
            sportId: string;
            createdAt: Date;
            updatedAt: Date;
            managerId: string;
            logo: string | null;
            city: string | null;
            state: string | null;
        };
    } & {
        id: string;
        status: string;
        tournamentId: string;
        teamId: string;
        seed: number | null;
        registeredAt: Date;
    }>;
    approveTeam(id: string, teamId: string): Promise<{
        id: string;
        status: string;
        tournamentId: string;
        teamId: string;
        seed: number | null;
        registeredAt: Date;
    }>;
    generateFixtures(id: string): Promise<{
        sport: {
            id: string;
            name: string;
            createdAt: Date;
            updatedAt: Date;
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
        organizer: {
            id: string;
            email: string;
            firstName: string;
            lastName: string;
        };
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
                        city: string | null;
                        state: string | null;
                        sportsId: string;
                        userId: string;
                        dateOfBirth: Date | null;
                        gender: string | null;
                        country: string;
                        primarySport: string | null;
                        bio: string | null;
                        totalMatches: number;
                        totalWins: number;
                        careerStats: string | null;
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
                name: string;
                sportId: string;
                createdAt: Date;
                updatedAt: Date;
                managerId: string;
                logo: string | null;
                city: string | null;
                state: string | null;
            };
        } & {
            id: string;
            status: string;
            tournamentId: string;
            teamId: string;
            seed: number | null;
            registeredAt: Date;
        })[];
        matches: ({
            homeTeam: {
                id: string;
                name: string;
                sportId: string;
                createdAt: Date;
                updatedAt: Date;
                managerId: string;
                logo: string | null;
                city: string | null;
                state: string | null;
            } | null;
            awayTeam: {
                id: string;
                name: string;
                sportId: string;
                createdAt: Date;
                updatedAt: Date;
                managerId: string;
                logo: string | null;
                city: string | null;
                state: string | null;
            } | null;
            winnerTeam: {
                id: string;
                name: string;
                sportId: string;
                createdAt: Date;
                updatedAt: Date;
                managerId: string;
                logo: string | null;
                city: string | null;
                state: string | null;
            } | null;
        } & {
            id: string;
            sportId: string;
            status: string;
            venue: string | null;
            createdAt: Date;
            updatedAt: Date;
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
    } & {
        id: string;
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
        createdAt: Date;
        updatedAt: Date;
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
                    city: string | null;
                    state: string | null;
                    sportsId: string;
                    userId: string;
                    dateOfBirth: Date | null;
                    gender: string | null;
                    country: string;
                    primarySport: string | null;
                    bio: string | null;
                    totalMatches: number;
                    totalWins: number;
                    careerStats: string | null;
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
            name: string;
            sportId: string;
            createdAt: Date;
            updatedAt: Date;
            managerId: string;
            logo: string | null;
            city: string | null;
            state: string | null;
        };
    } & {
        id: string;
        status: string;
        tournamentId: string;
        teamId: string;
        seed: number | null;
        registeredAt: Date;
    })[]>;
    withdrawTeam(id: string, teamId: string): Promise<{
        id: string;
        status: string;
        tournamentId: string;
        teamId: string;
        seed: number | null;
        registeredAt: Date;
    }>;
    rejectTeam(id: string, teamId: string): Promise<{
        id: string;
        status: string;
        tournamentId: string;
        teamId: string;
        seed: number | null;
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
        description: string | null;
        createdAt: Date;
        tournamentId: string;
        type: string;
        uploadedBy: string;
        title: string;
        url: string;
    }[]>;
    addMedia(id: string, req: any, body: any): Promise<{
        id: string;
        description: string | null;
        createdAt: Date;
        tournamentId: string;
        type: string;
        uploadedBy: string;
        title: string;
        url: string;
    }>;
}
