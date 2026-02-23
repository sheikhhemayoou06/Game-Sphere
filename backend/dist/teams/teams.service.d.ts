import { PrismaService } from '../prisma/prisma.service';
export declare class TeamsService {
    private prisma;
    constructor(prisma: PrismaService);
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
            tournamentId: string;
            teamId: string;
            registeredAt: Date;
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
    create(userId: string, data: {
        name: string;
        sportId: string;
        logo?: string;
        city?: string;
        state?: string;
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
    update(id: string, userId: string, data: Partial<{
        name: string;
        logo: string;
        city: string;
        state: string;
    }>): Promise<{
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
    addPlayer(teamId: string, playerId: string, jersey?: number, role?: string): Promise<{
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
    getMyTeams(userId: string, sportId?: string): Promise<({
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
    getMySports(userId: string): Promise<{
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
}
