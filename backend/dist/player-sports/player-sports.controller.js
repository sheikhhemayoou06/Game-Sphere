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
exports.PlayerSportsController = void 0;
const common_1 = require("@nestjs/common");
const player_sports_service_1 = require("./player-sports.service");
const jwt_auth_guard_1 = require("../auth/jwt-auth.guard");
let PlayerSportsController = class PlayerSportsController {
    playerSportsService;
    constructor(playerSportsService) {
        this.playerSportsService = playerSportsService;
    }
    registerForSport(playerId, body) {
        return this.playerSportsService.registerForSport(playerId, body.sportId, body.metadata);
    }
    getPlayerSports(playerId) {
        return this.playerSportsService.getPlayerSports(playerId);
    }
};
exports.PlayerSportsController = PlayerSportsController;
__decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, common_1.Post)(':playerId/sports'),
    __param(0, (0, common_1.Param)('playerId')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", void 0)
], PlayerSportsController.prototype, "registerForSport", null);
__decorate([
    (0, common_1.Get)(':playerId/sports'),
    __param(0, (0, common_1.Param)('playerId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], PlayerSportsController.prototype, "getPlayerSports", null);
exports.PlayerSportsController = PlayerSportsController = __decorate([
    (0, common_1.Controller)('players'),
    __metadata("design:paramtypes", [player_sports_service_1.PlayerSportsService])
], PlayerSportsController);
//# sourceMappingURL=player-sports.controller.js.map