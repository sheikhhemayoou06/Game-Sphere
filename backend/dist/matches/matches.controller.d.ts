import { MatchesService } from './matches.service';
export declare class MatchesController {
    private matchesService;
    constructor(matchesService: MatchesService);
    findAll(tournamentId?: string, status?: string, sportId?: string): Promise<({
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
    })[]>;
    getLiveMatches(): Promise<({
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
    })[]>;
    getUpcomingMatches(): Promise<({
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
        tournament: {
            id: string;
            name: string;
            format: string;
        };
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
        playerStats: ({
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
            matchId: string;
            playerId: string;
            statsData: string | null;
        })[];
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
    }>;
    updateScore(id: string, scoreData: any): Promise<{
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
    }>;
    completeMatch(id: string, data: any): Promise<{
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
    }>;
    updatePlayerStats(matchId: string, playerId: string, statsData: any): Promise<{
        id: string;
        matchId: string;
        playerId: string;
        statsData: string | null;
    }>;
}
