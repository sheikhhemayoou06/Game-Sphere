import { PrismaService } from '../prisma/prisma.service';
export declare class TournamentsService {
    private prisma;
    constructor(prisma: PrismaService);
    findAll(filters?: {
        sportId?: string;
        status?: string;
        level?: string;
    }): Promise<({
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
                        district: string | null;
                        state: string | null;
                        country: string;
                        primarySport: string | null;
                        bio: string | null;
                        heightCm: number | null;
                        weightKg: number | null;
                        totalMatches: number;
                        totalWins: number;
                        careerStats: string | null;
                        userId: string;
                    };
                } & {
                    id: string;
                    role: string | null;
                    playerId: string;
                    teamId: string;
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
    create(userId: string, data: {
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
    }): Promise<{
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
    update(id: string, userId: string, data: any): Promise<{
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
    }>;
    addTeam(tournamentId: string, teamId: string): Promise<{
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
    approveTeam(tournamentId: string, teamId: string): Promise<{
        id: string;
        seed: number | null;
        status: string;
        registeredAt: Date;
        tournamentId: string;
        teamId: string;
    }>;
    rejectTeam(tournamentId: string, teamId: string): Promise<{
        id: string;
        seed: number | null;
        status: string;
        registeredAt: Date;
        tournamentId: string;
        teamId: string;
    }>;
    withdrawTeam(tournamentId: string, teamId: string): Promise<{
        id: string;
        seed: number | null;
        status: string;
        registeredAt: Date;
        tournamentId: string;
        teamId: string;
    }>;
    generateFixtures(tournamentId: string): Promise<{
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
                        district: string | null;
                        state: string | null;
                        country: string;
                        primarySport: string | null;
                        bio: string | null;
                        heightCm: number | null;
                        weightKg: number | null;
                        totalMatches: number;
                        totalWins: number;
                        careerStats: string | null;
                        userId: string;
                    };
                } & {
                    id: string;
                    role: string | null;
                    playerId: string;
                    teamId: string;
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
    getStats(tournamentId: string): Promise<{
        totalTeams: number;
        approvedTeams: number;
        totalMatches: number;
        completedMatches: number;
        liveMatches: number;
        upcomingMatches: number;
    }>;
    getTournamentTeams(tournamentId: string): Promise<({
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
                    district: string | null;
                    state: string | null;
                    country: string;
                    primarySport: string | null;
                    bio: string | null;
                    heightCm: number | null;
                    weightKg: number | null;
                    totalMatches: number;
                    totalWins: number;
                    careerStats: string | null;
                    userId: string;
                };
            } & {
                id: string;
                role: string | null;
                playerId: string;
                teamId: string;
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
    })[]>;
    getTournamentFinancials(tournamentId: string): Promise<{
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
    getLeaderboard(tournamentId: string): Promise<{
        teamId: string;
        teamName: string;
        teamLogo: string | null;
        played: number;
        wins: number;
        losses: number;
        draws: number;
        points: number;
    }[]>;
    getChatMessages(tournamentId: string): Promise<{
        id: string;
        createdAt: Date;
        tournamentId: string;
        type: string;
        message: string;
        senderId: string;
    }[]>;
    sendChatMessage(tournamentId: string, senderId: string, message: string, type?: string): Promise<{
        id: string;
        createdAt: Date;
        tournamentId: string;
        type: string;
        message: string;
        senderId: string;
    }>;
    getMedia(tournamentId: string): Promise<{
        id: string;
        createdAt: Date;
        description: string | null;
        tournamentId: string;
        type: string;
        title: string;
        uploadedBy: string;
        url: string;
    }[]>;
    addMedia(tournamentId: string, uploadedBy: string, data: {
        type: string;
        title: string;
        description?: string;
        url: string;
    }): Promise<{
        id: string;
        createdAt: Date;
        description: string | null;
        tournamentId: string;
        type: string;
        title: string;
        uploadedBy: string;
        url: string;
    }>;
}
