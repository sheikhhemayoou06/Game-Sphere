import { PlayerSportsService } from './player-sports.service';
export declare class PlayerSportsController {
    private playerSportsService;
    constructor(playerSportsService: PlayerSportsService);
    registerForSport(playerId: string, body: {
        sportId: string;
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
