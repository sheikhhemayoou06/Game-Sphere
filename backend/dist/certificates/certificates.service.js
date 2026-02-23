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
exports.CertificatesService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
const crypto_1 = require("crypto");
let CertificatesService = class CertificatesService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async getAll(tournamentId, playerId, type) {
        const where = {};
        if (tournamentId)
            where.tournamentId = tournamentId;
        if (playerId)
            where.playerId = playerId;
        if (type)
            where.type = type;
        return this.prisma.certificate.findMany({
            where,
            orderBy: { issuedAt: 'desc' },
        });
    }
    async getById(id) {
        return this.prisma.certificate.findUnique({ where: { id } });
    }
    async verify(code) {
        const cert = await this.prisma.certificate.findUnique({
            where: { verificationCode: code },
        });
        return cert ? { valid: true, certificate: cert } : { valid: false };
    }
    async generate(data) {
        return this.prisma.certificate.create({
            data: {
                ...data,
                verificationCode: (0, crypto_1.randomUUID)(),
            },
        });
    }
    async generateBulk(tournamentId, tournamentName, sportName, participants) {
        const certs = [];
        for (const p of participants) {
            const cert = await this.prisma.certificate.create({
                data: {
                    type: p.position ? 'WINNER' : 'PARTICIPATION',
                    recipientName: p.name,
                    playerId: p.playerId,
                    tournamentId,
                    tournamentName,
                    sportName,
                    position: p.position,
                    verificationCode: (0, crypto_1.randomUUID)(),
                },
            });
            certs.push(cert);
        }
        return certs;
    }
};
exports.CertificatesService = CertificatesService;
exports.CertificatesService = CertificatesService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], CertificatesService);
//# sourceMappingURL=certificates.service.js.map