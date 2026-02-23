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
exports.RankingsController = void 0;
const common_1 = require("@nestjs/common");
const rankings_service_1 = require("./rankings.service");
const jwt_auth_guard_1 = require("../auth/jwt-auth.guard");
let RankingsController = class RankingsController {
    rankingsService;
    constructor(rankingsService) {
        this.rankingsService = rankingsService;
    }
    getLeaderboard(sportId, level) {
        return this.rankingsService.getLeaderboard(sportId, level);
    }
    getPlayerRankings(playerId) {
        return this.rankingsService.getPlayerRankings(playerId);
    }
    getTeamRankings(teamId) {
        return this.rankingsService.getTeamRankings(teamId);
    }
    upsertRanking(data) {
        return this.rankingsService.upsertRanking(data);
    }
    recalculateRanks(sportId, level) {
        return this.rankingsService.recalculateRanks(sportId, level);
    }
};
exports.RankingsController = RankingsController;
__decorate([
    (0, common_1.Get)(),
    __param(0, (0, common_1.Query)('sportId')),
    __param(1, (0, common_1.Query)('level')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", void 0)
], RankingsController.prototype, "getLeaderboard", null);
__decorate([
    (0, common_1.Get)('player/:playerId'),
    __param(0, (0, common_1.Param)('playerId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], RankingsController.prototype, "getPlayerRankings", null);
__decorate([
    (0, common_1.Get)('team/:teamId'),
    __param(0, (0, common_1.Param)('teamId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], RankingsController.prototype, "getTeamRankings", null);
__decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, common_1.Post)(),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], RankingsController.prototype, "upsertRanking", null);
__decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, common_1.Put)('recalculate'),
    __param(0, (0, common_1.Query)('sportId')),
    __param(1, (0, common_1.Query)('level')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", void 0)
], RankingsController.prototype, "recalculateRanks", null);
exports.RankingsController = RankingsController = __decorate([
    (0, common_1.Controller)('rankings'),
    __metadata("design:paramtypes", [rankings_service_1.RankingsService])
], RankingsController);
//# sourceMappingURL=rankings.controller.js.map