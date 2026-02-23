import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { randomUUID } from 'crypto';

@Injectable()
export class CertificatesService {
    constructor(private prisma: PrismaService) { }

    async getAll(tournamentId?: string, playerId?: string, type?: string) {
        const where: any = {};
        if (tournamentId) where.tournamentId = tournamentId;
        if (playerId) where.playerId = playerId;
        if (type) where.type = type;

        return this.prisma.certificate.findMany({
            where,
            orderBy: { issuedAt: 'desc' },
        });
    }

    async getById(id: string) {
        return this.prisma.certificate.findUnique({ where: { id } });
    }

    async verify(code: string) {
        const cert = await this.prisma.certificate.findUnique({
            where: { verificationCode: code },
        });
        return cert ? { valid: true, certificate: cert } : { valid: false };
    }

    async generate(data: {
        type: string;
        recipientName: string;
        playerId?: string;
        teamId?: string;
        tournamentId?: string;
        sportName?: string;
        tournamentName?: string;
        position?: string;
    }) {
        return this.prisma.certificate.create({
            data: {
                ...data,
                verificationCode: randomUUID(),
            },
        });
    }

    async generateBulk(tournamentId: string, tournamentName: string, sportName: string, participants: { name: string; playerId?: string; position?: string }[]) {
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
                    verificationCode: randomUUID(),
                },
            });
            certs.push(cert);
        }
        return certs;
    }
}
