import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class TransfersService {
    constructor(private prisma: PrismaService) { }

    async getAll(status?: string) {
        const where: any = {};
        if (status) where.status = status;
        return this.prisma.transfer.findMany({
            where,
            orderBy: { requestedAt: 'desc' },
        });
    }

    async getByPlayer(playerId: string) {
        return this.prisma.transfer.findMany({
            where: { playerId },
            orderBy: { requestedAt: 'desc' },
        });
    }

    async getById(id: string) {
        return this.prisma.transfer.findUnique({ where: { id } });
    }

    async requestTransfer(data: {
        playerId: string;
        fromTeamId?: string;
        toTeamId: string;
        transferFee?: number;
        reason?: string;
    }) {
        return this.prisma.transfer.create({ data });
    }

    async approveTransfer(id: string, approvedBy: string) {
        const transfer = await this.prisma.transfer.update({
            where: { id },
            data: {
                status: 'APPROVED',
                approvedBy,
                resolvedAt: new Date(),
            },
        });

        // Move player: remove from old team, add to new team
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

    async rejectTransfer(id: string, approvedBy: string) {
        return this.prisma.transfer.update({
            where: { id },
            data: {
                status: 'REJECTED',
                approvedBy,
                resolvedAt: new Date(),
            },
        });
    }
}
