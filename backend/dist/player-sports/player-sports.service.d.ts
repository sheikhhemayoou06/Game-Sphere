import { PrismaService } from '../prisma/prisma.service';
export declare class PlayerSportsService {
    private prisma;
    constructor(prisma: PrismaService);
    registerForSport(playerId: string, sportId: string): Promise<{
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
        sportId: string;
        playerId: string;
        sportCode: string;
    }>;
    getPlayerSports(playerId: string): Promise<({
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
        sportId: string;
        playerId: string;
        sportCode: string;
    })[]>;
}
