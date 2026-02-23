import { PrismaService } from '../prisma/prisma.service';
export declare class SportsService {
    private prisma;
    constructor(prisma: PrismaService);
    findAll(): Promise<{
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
    findOne(id: string): Promise<{
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
    }>;
    create(data: {
        name: string;
        icon?: string;
        accentColor?: string;
        teamSize?: number;
        maxPlayers?: number;
        scoringRules?: any;
        statFields?: any;
        matchDuration?: string;
        pointsSystem?: any;
        tieBreakerRules?: any;
    }): Promise<{
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
    }>;
    update(id: string, data: Partial<{
        name: string;
        icon: string;
        accentColor: string;
        teamSize: number;
        maxPlayers: number;
        scoringRules: any;
        statFields: any;
        matchDuration: string;
        pointsSystem: any;
        tieBreakerRules: any;
        isActive: boolean;
    }>): Promise<{
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
    }>;
    seed(): Promise<{
        message: string;
    }>;
}
