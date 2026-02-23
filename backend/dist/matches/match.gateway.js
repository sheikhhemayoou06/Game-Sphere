"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.MatchGateway = void 0;
const websockets_1 = require("@nestjs/websockets");
const socket_io_1 = require("socket.io");
const matches_service_1 = require("./matches.service");
let MatchGateway = class MatchGateway {
    matchesService;
    server;
    constructor(matchesService) {
        this.matchesService = matchesService;
    }
    handleConnection(client) {
        console.log(`Client connected: ${client.id}`);
    }
    handleDisconnect(client) {
        console.log(`Client disconnected: ${client.id}`);
    }
    handleJoinMatch(client, matchId) {
        client.join(`match-${matchId}`);
        return { event: 'joined', matchId };
    }
    handleLeaveMatch(client, matchId) {
        client.leave(`match-${matchId}`);
        return { event: 'left', matchId };
    }
    async handleScoreUpdate(data) {
        const match = await this.matchesService.updateScore(data.matchId, data.scoreData);
        this.server.to(`match-${data.matchId}`).emit('scoreUpdated', match);
        return match;
    }
    async handleMatchComplete(data) {
        const match = await this.matchesService.completeMatch(data.matchId, {
            winnerTeamId: data.winnerTeamId,
            scoreData: data.scoreData,
        });
        this.server.to(`match-${data.matchId}`).emit('matchCompleted', match);
        return match;
    }
};
exports.MatchGateway = MatchGateway;
__decorate([
    (0, websockets_1.WebSocketServer)(),
    __metadata("design:type", socket_io_1.Server)
], MatchGateway.prototype, "server", void 0);
__decorate([
    (0, websockets_1.SubscribeMessage)('joinMatch'),
    __param(0, (0, websockets_1.ConnectedSocket)()),
    __param(1, (0, websockets_1.MessageBody)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [socket_io_1.Socket, String]),
    __metadata("design:returntype", void 0)
], MatchGateway.prototype, "handleJoinMatch", null);
__decorate([
    (0, websockets_1.SubscribeMessage)('leaveMatch'),
    __param(0, (0, websockets_1.ConnectedSocket)()),
    __param(1, (0, websockets_1.MessageBody)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [socket_io_1.Socket, String]),
    __metadata("design:returntype", void 0)
], MatchGateway.prototype, "handleLeaveMatch", null);
__decorate([
    (0, websockets_1.SubscribeMessage)('updateScore'),
    __param(0, (0, websockets_1.MessageBody)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], MatchGateway.prototype, "handleScoreUpdate", null);
__decorate([
    (0, websockets_1.SubscribeMessage)('completeMatch'),
    __param(0, (0, websockets_1.MessageBody)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], MatchGateway.prototype, "handleMatchComplete", null);
exports.MatchGateway = MatchGateway = __decorate([
    (0, websockets_1.WebSocketGateway)({
        cors: { origin: '*' },
        namespace: '/matches',
    }),
    __metadata("design:paramtypes", [matches_service_1.MatchesService])
], MatchGateway);
//# sourceMappingURL=match.gateway.js.map