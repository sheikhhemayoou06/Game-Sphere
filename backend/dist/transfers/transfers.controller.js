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
exports.TransfersController = void 0;
const common_1 = require("@nestjs/common");
const transfers_service_1 = require("./transfers.service");
const jwt_auth_guard_1 = require("../auth/jwt-auth.guard");
let TransfersController = class TransfersController {
    transfersService;
    constructor(transfersService) {
        this.transfersService = transfersService;
    }
    getAll(status) {
        return this.transfersService.getAll(status);
    }
    getByPlayer(playerId) {
        return this.transfersService.getByPlayer(playerId);
    }
    getById(id) {
        return this.transfersService.getById(id);
    }
    requestTransfer(data) {
        return this.transfersService.requestTransfer(data);
    }
    approveTransfer(id, req) {
        return this.transfersService.approveTransfer(id, req.user.sub);
    }
    rejectTransfer(id, req) {
        return this.transfersService.rejectTransfer(id, req.user.sub);
    }
};
exports.TransfersController = TransfersController;
__decorate([
    (0, common_1.Get)(),
    __param(0, (0, common_1.Query)('status')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], TransfersController.prototype, "getAll", null);
__decorate([
    (0, common_1.Get)('player/:playerId'),
    __param(0, (0, common_1.Param)('playerId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], TransfersController.prototype, "getByPlayer", null);
__decorate([
    (0, common_1.Get)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], TransfersController.prototype, "getById", null);
__decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, common_1.Post)(),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], TransfersController.prototype, "requestTransfer", null);
__decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, common_1.Put)(':id/approve'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", void 0)
], TransfersController.prototype, "approveTransfer", null);
__decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, common_1.Put)(':id/reject'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", void 0)
], TransfersController.prototype, "rejectTransfer", null);
exports.TransfersController = TransfersController = __decorate([
    (0, common_1.Controller)('transfers'),
    __metadata("design:paramtypes", [transfers_service_1.TransfersService])
], TransfersController);
//# sourceMappingURL=transfers.controller.js.map