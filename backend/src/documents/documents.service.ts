import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class DocumentsService {
    constructor(private prisma: PrismaService) { }

    async getDocuments(filters?: { playerId?: string; type?: string; status?: string }) {
        return this.prisma.document.findMany({
            where: {
                ...(filters?.playerId && { playerId: filters.playerId }),
                ...(filters?.type && { type: filters.type }),
                ...(filters?.status && { status: filters.status }),
            },
            orderBy: { createdAt: 'desc' },
        });
    }

    async getDocument(id: string) {
        return this.prisma.document.findUnique({ where: { id } });
    }

    async createDocument(data: {
        type: string;
        title: string;
        description?: string;
        playerId?: string;
        tournamentId?: string;
        teamId?: string;
        uploadedBy: string;
        fileUrl?: string;
    }) {
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

    async approveDocument(id: string, reviewedBy: string) {
        return this.prisma.document.update({
            where: { id },
            data: { status: 'APPROVED', reviewedBy, reviewedAt: new Date() },
        });
    }

    async rejectDocument(id: string, reviewedBy: string, reason?: string) {
        return this.prisma.document.update({
            where: { id },
            data: { status: 'REJECTED', reviewedBy, reviewedAt: new Date(), rejectionReason: reason },
        });
    }

    async getPlayerDocuments(playerId: string) {
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
}
