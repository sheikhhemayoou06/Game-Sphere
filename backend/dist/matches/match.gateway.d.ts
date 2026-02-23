import { OnGatewayConnection, OnGatewayDisconnect } from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { MatchesService } from './matches.service';
export declare class MatchGateway implements OnGatewayConnection, OnGatewayDisconnect {
    private matchesService;
    server: Server;
    constructor(matchesService: MatchesService);
    handleConnection(client: Socket): void;
    handleDisconnect(client: Socket): void;
    handleJoinMatch(client: Socket, matchId: string): {
        event: string;
        matchId: string;
    };
    handleLeaveMatch(client: Socket, matchId: string): {
        event: string;
        matchId: string;
    };
    handleScoreUpdate(data: {
        matchId: string;
        scoreData: any;
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
    handleMatchComplete(data: {
        matchId: string;
        winnerTeamId: string;
        scoreData: any;
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
}
