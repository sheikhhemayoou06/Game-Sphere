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
exports.DocumentsService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
let DocumentsService = class DocumentsService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async getDocuments(filters) {
        return this.prisma.document.findMany({
            where: {
                ...(filters?.playerId && { playerId: filters.playerId }),
                ...(filters?.type && { type: filters.type }),
                ...(filters?.status && { status: filters.status }),
            },
            orderBy: { createdAt: 'desc' },
        });
    }
    async getDocument(id) {
        return this.prisma.document.findUnique({ where: { id } });
    }
    async createDocument(data) {
        return this.prisma.document.create({
            data: {
                type: data.type,
                title: data.title,
                description: data.description,
                playerId: data.playerId,
                tournamentId: data.tournamentId,
                teamId: data.teamId,
                uploadedBy: data.uploadedBy,
                fileUrl: data.fileUrl || '',
                status: 'PENDING',
            },
        });
    }
    async approveDocument(id, reviewedBy) {
        return this.prisma.document.update({
            where: { id },
            data: { status: 'APPROVED', reviewedBy, reviewedAt: new Date() },
        });
    }
    async rejectDocument(id, reviewedBy, reason) {
        return this.prisma.document.update({
            where: { id },
            data: { status: 'REJECTED', reviewedBy, reviewedAt: new Date(), rejectionReason: reason },
        });
    }
    async getPlayerDocuments(playerId) {
        return this.prisma.document.findMany({
            where: { playerId },
            orderBy: { createdAt: 'desc' },
        });
    }
    async getPendingDocuments() {
        return this.prisma.document.findMany({
            where: { status: 'PENDING' },
            orderBy: { createdAt: 'asc' },
        });
    }
};
exports.DocumentsService = DocumentsService;
exports.DocumentsService = DocumentsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], DocumentsService);
//# sourceMappingURL=documents.service.js.map