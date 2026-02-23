import { SportsService } from './sports.service';
export declare class SportsController {
    private sportsService;
    constructor(sportsService: SportsService);
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
    create(data: any): Promise<{
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
    update(id: string, data: any): Promise<{
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
