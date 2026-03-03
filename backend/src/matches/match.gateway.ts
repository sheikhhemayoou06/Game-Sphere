import {
    WebSocketGateway,
    WebSocketServer,
    SubscribeMessage,
    MessageBody,
    ConnectedSocket,
    OnGatewayConnection,
    OnGatewayDisconnect,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { MatchesService } from './matches.service';

@WebSocketGateway({
    cors: { origin: '*' },
    namespace: '/matches',
})
export class MatchGateway implements OnGatewayConnection, OnGatewayDisconnect {
    @WebSocketServer()
    server!: Server;

    constructor(private matchesService: MatchesService) { }

    handleConnection(client: Socket) {
        console.log(`Client connected: ${client.id}`);
    }

    handleDisconnect(client: Socket) {
        console.log(`Client disconnected: ${client.id}`);
    }

    @SubscribeMessage('joinMatch')
    handleJoinMatch(
        @ConnectedSocket() client: Socket,
        @MessageBody() matchId: string,
    ) {
        client.join(`match-${matchId}`);
        return { event: 'joined', matchId };
    }

    @SubscribeMessage('leaveMatch')
    handleLeaveMatch(
        @ConnectedSocket() client: Socket,
        @MessageBody() matchId: string,
    ) {
        client.leave(`match-${matchId}`);
        return { event: 'left', matchId };
    }

    @SubscribeMessage('updateScore')
    async handleScoreUpdate(
        @MessageBody() data: { matchId: string; scoreData: any },
    ) {
        const match = await this.matchesService.updateScore(data.matchId, data.scoreData, 'system');
        this.server.to(`match-${data.matchId}`).emit('scoreUpdated', match);
        return match;
    }

    @SubscribeMessage('completeMatch')
    async handleMatchComplete(
        @MessageBody() data: { matchId: string; winnerTeamId: string; scoreData: any },
    ) {
        const match = await this.matchesService.completeMatch(data.matchId, {
            winnerTeamId: data.winnerTeamId,
            scoreData: data.scoreData,
        }, 'system');
        this.server.to(`match-${data.matchId}`).emit('matchCompleted', match);
        return match;
    }
}
