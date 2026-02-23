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
exports.TournamentsController = void 0;
const common_1 = require("@nestjs/common");
const tournaments_service_1 = require("./tournaments.service");
const jwt_auth_guard_1 = require("../auth/jwt-auth.guard");
let TournamentsController = class TournamentsController {
    tournamentsService;
    constructor(tournamentsService) {
        this.tournamentsService = tournamentsService;
    }
    findAll(sportId, status, level) {
        return this.tournamentsService.findAll({ sportId, status, level });
    }
    findOne(id) {
        return this.tournamentsService.findOne(id);
    }
    getStats(id) {
        return this.tournamentsService.getStats(id);
    }
    create(req, data) {
        return this.tournamentsService.create(req.user.sub, data);
    }
    update(id, req, data) {
        return this.tournamentsService.update(id, req.user.sub, data);
    }
    updateStatus(id, status) {
        return this.tournamentsService.updateStatus(id, status);
    }
    addTeam(id, teamId) {
        return this.tournamentsService.addTeam(id, teamId);
    }
    approveTeam(id, teamId) {
        return this.tournamentsService.approveTeam(id, teamId);
    }
    generateFixtures(id) {
        return this.tournamentsService.generateFixtures(id);
    }
    getTournamentTeams(id) {
        return this.tournamentsService.getTournamentTeams(id);
    }
    withdrawTeam(id, teamId) {
        return this.tournamentsService.withdrawTeam(id, teamId);
    }
    rejectTeam(id, teamId) {
        return this.tournamentsService.rejectTeam(id, teamId);
    }
    getFinancials(id) {
        return this.tournamentsService.getTournamentFinancials(id);
    }
    getLeaderboard(id) {
        return this.tournamentsService.getLeaderboard(id);
    }
    getChatMessages(id) {
        return this.tournamentsService.getChatMessages(id);
    }
    sendChatMessage(id, req, body) {
        return this.tournamentsService.sendChatMessage(id, req.user.sub, body.message, body.type);
    }
    getMedia(id) {
        return this.tournamentsService.getMedia(id);
    }
    addMedia(id, req, body) {
        return this.tournamentsService.addMedia(id, req.user.sub, body);
    }
};
exports.TournamentsController = TournamentsController;
__decorate([
    (0, common_1.Get)(),
    __param(0, (0, common_1.Query)('sportId')),
    __param(1, (0, common_1.Query)('status')),
    __param(2, (0, common_1.Query)('level')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String]),
    __metadata("design:returntype", void 0)
], TournamentsController.prototype, "findAll", null);
__decorate([
    (0, common_1.Get)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], TournamentsController.prototype, "findOne", null);
__decorate([
    (0, common_1.Get)(':id/stats'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], TournamentsController.prototype, "getStats", null);
__decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, common_1.Post)(),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", void 0)
], TournamentsController.prototype, "create", null);
__decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, common_1.Put)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Request)()),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object, Object]),
    __metadata("design:returntype", void 0)
], TournamentsController.prototype, "update", null);
__decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, common_1.Put)(':id/status'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)('status')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", void 0)
], TournamentsController.prototype, "updateStatus", null);
__decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, common_1.Post)(':id/teams'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)('teamId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", void 0)
], TournamentsController.prototype, "addTeam", null);
__decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, common_1.Put)(':id/teams/:teamId/approve'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Param)('teamId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", void 0)
], TournamentsController.prototype, "approveTeam", null);
__decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, common_1.Post)(':id/fixtures'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], TournamentsController.prototype, "generateFixtures", null);
__decorate([
    (0, common_1.Get)(':id/teams'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], TournamentsController.prototype, "getTournamentTeams", null);
__decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, common_1.Put)(':id/teams/:teamId/withdraw'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Param)('teamId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", void 0)
], TournamentsController.prototype, "withdrawTeam", null);
__decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, common_1.Put)(':id/teams/:teamId/reject'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Param)('teamId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", void 0)
], TournamentsController.prototype, "rejectTeam", null);
__decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, common_1.Get)(':id/financials'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], TournamentsController.prototype, "getFinancials", null);
__decorate([
    (0, common_1.Get)(':id/leaderboard'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], TournamentsController.prototype, "getLeaderboard", null);
__decorate([
    (0, common_1.Get)(':id/chat'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], TournamentsController.prototype, "getChatMessages", null);
__decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, common_1.Post)(':id/chat'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Request)()),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object, Object]),
    __metadata("design:returntype", void 0)
], TournamentsController.prototype, "sendChatMessage", null);
__decorate([
    (0, common_1.Get)(':id/media'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], TournamentsController.prototype, "getMedia", null);
__decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, common_1.Post)(':id/media'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Request)()),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object, Object]),
    __metadata("design:returntype", void 0)
], TournamentsController.prototype, "addMedia", null);
exports.TournamentsController = TournamentsController = __decorate([
    (0, common_1.Controller)('tournaments'),
    __metadata("design:paramtypes", [tournaments_service_1.TournamentsService])
], TournamentsController);
//# sourceMappingURL=tournaments.controller.js.map