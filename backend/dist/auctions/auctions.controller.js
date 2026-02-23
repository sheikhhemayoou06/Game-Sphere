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
exports.AuctionsController = void 0;
const common_1 = require("@nestjs/common");
const auctions_service_1 = require("./auctions.service");
const jwt_auth_guard_1 = require("../auth/jwt-auth.guard");
let AuctionsController = class AuctionsController {
    auctionsService;
    constructor(auctionsService) {
        this.auctionsService = auctionsService;
    }
    getAuction(tournamentId) {
        return this.auctionsService.getAuction(tournamentId);
    }
    createAuction(tournamentId, teamBudget) {
        return this.auctionsService.createAuction(tournamentId, teamBudget);
    }
    updateStatus(auctionId, status) {
        return this.auctionsService.updateAuctionStatus(auctionId, status);
    }
    addPlayer(auctionId, body) {
        return this.auctionsService.addPlayerToAuction(auctionId, body.playerId, body.basePrice);
    }
    approvePlayer(auctionPlayerId) {
        return this.auctionsService.approvePlayer(auctionPlayerId);
    }
    placeBid(apId, body) {
        return this.auctionsService.placeBid(apId, body.teamId, body.amount);
    }
    sellPlayer(apId, body) {
        return this.auctionsService.sellPlayer(apId, body.teamId, body.soldPrice);
    }
    markUnsold(auctionPlayerId) {
        return this.auctionsService.markUnsold(auctionPlayerId);
    }
};
exports.AuctionsController = AuctionsController;
__decorate([
    (0, common_1.Get)(),
    __param(0, (0, common_1.Param)('tournamentId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], AuctionsController.prototype, "getAuction", null);
__decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, common_1.Post)(),
    __param(0, (0, common_1.Param)('tournamentId')),
    __param(1, (0, common_1.Body)('teamBudget')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Number]),
    __metadata("design:returntype", void 0)
], AuctionsController.prototype, "createAuction", null);
__decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, common_1.Put)(':auctionId/status'),
    __param(0, (0, common_1.Param)('auctionId')),
    __param(1, (0, common_1.Body)('status')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", void 0)
], AuctionsController.prototype, "updateStatus", null);
__decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, common_1.Post)(':auctionId/players'),
    __param(0, (0, common_1.Param)('auctionId')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", void 0)
], AuctionsController.prototype, "addPlayer", null);
__decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, common_1.Put)('players/:auctionPlayerId/approve'),
    __param(0, (0, common_1.Param)('auctionPlayerId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], AuctionsController.prototype, "approvePlayer", null);
__decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, common_1.Put)('players/:auctionPlayerId/bid'),
    __param(0, (0, common_1.Param)('auctionPlayerId')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", void 0)
], AuctionsController.prototype, "placeBid", null);
__decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, common_1.Put)('players/:auctionPlayerId/sell'),
    __param(0, (0, common_1.Param)('auctionPlayerId')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", void 0)
], AuctionsController.prototype, "sellPlayer", null);
__decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, common_1.Put)('players/:auctionPlayerId/unsold'),
    __param(0, (0, common_1.Param)('auctionPlayerId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], AuctionsController.prototype, "markUnsold", null);
exports.AuctionsController = AuctionsController = __decorate([
    (0, common_1.Controller)('tournaments/:tournamentId/auction'),
    __metadata("design:paramtypes", [auctions_service_1.AuctionsService])
], AuctionsController);
//# sourceMappingURL=auctions.controller.js.map