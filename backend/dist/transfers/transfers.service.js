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
Object.defineProperty(exports, "__esModule", { value: true });
exports.TransfersService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
let TransfersService = class TransfersService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async getAll(status) {
        const where = {};
        if (status)
            where.status = status;
        return this.prisma.transfer.findMany({
            where,
            orderBy: { requestedAt: 'desc' },
        });
    }
    async getByPlayer(playerId) {
        return this.prisma.transfer.findMany({
            where: { playerId },
            orderBy: { requestedAt: 'desc' },
        });
    }
    async getById(id) {
        return this.prisma.transfer.findUnique({ where: { id } });
    }
    async requestTransfer(data) {
        return this.prisma.transfer.create({ data });
    }
    async approveTransfer(id, approvedBy) {
        const transfer = await this.prisma.transfer.update({
            where: { id },
            data: {
                status: 'APPROVED',
                approvedBy,
                resolvedAt: new Date(),
            },
        });
        if (transfer.fromTeamId) {
            await this.prisma.teamPlayer.deleteMany({
                where: { playerId: transfer.playerId, teamId: transfer.fromTeamId },
            });
        }
        await this.prisma.teamPlayer.create({
            data: {
                playerId: transfer.playerId,
                teamId: transfer.toTeamId,
            },
        });
        return transfer;
    }
    async rejectTransfer(id, approvedBy) {
        return this.prisma.transfer.update({
            where: { id },
            data: {
                status: 'REJECTED',
                approvedBy,
                resolvedAt: new Date(),
            },
        });
    }
};
exports.TransfersService = TransfersService;
exports.TransfersService = TransfersService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], TransfersService);
//# sourceMappingURL=transfers.service.js.map