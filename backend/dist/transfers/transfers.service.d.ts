import { PrismaService } from '../prisma/prisma.service';
export declare class TransfersService {
    private prisma;
    constructor(prisma: PrismaService);
    getAll(status?: string): Promise<{
        id: string;
        playerId: string;
        status: string;
        tournamentId: string | null;
        fromTeamId: string | null;
        toTeamId: string;
        transferFee: number;
        reason: string | null;
        approvedBy: string | null;
        requestedAt: Date;
        resolvedAt: Date | null;
    }[]>;
    getByPlayer(playerId: string): Promise<{
        id: string;
        playerId: string;
        status: string;
        tournamentId: string | null;
        fromTeamId: string | null;
        toTeamId: string;
        transferFee: number;
        reason: string | null;
        approvedBy: string | null;
        requestedAt: Date;
        resolvedAt: Date | null;
    }[]>;
    getById(id: string): Promise<{
        id: string;
        playerId: string;
        status: string;
        tournamentId: string | null;
        fromTeamId: string | null;
        toTeamId: string;
        transferFee: number;
        reason: string | null;
        approvedBy: string | null;
        requestedAt: Date;
        resolvedAt: Date | null;
    } | null>;
    requestTransfer(data: {
        playerId: string;
        fromTeamId?: string;
        toTeamId: string;
        transferFee?: number;
        reason?: string;
    }): Promise<{
        id: string;
        playerId: string;
        status: string;
        tournamentId: string | null;
        fromTeamId: string | null;
        toTeamId: string;
        transferFee: number;
        reason: string | null;
        approvedBy: string | null;
        requestedAt: Date;
        resolvedAt: Date | null;
    }>;
    approveTransfer(id: string, approvedBy: string): Promise<{
        id: string;
        playerId: string;
        status: string;
        tournamentId: string | null;
        fromTeamId: string | null;
        toTeamId: string;
        transferFee: number;
        reason: string | null;
        approvedBy: string | null;
        requestedAt: Date;
        resolvedAt: Date | null;
    }>;
    rejectTransfer(id: string, approvedBy: string): Promise<{
        id: string;
        playerId: string;
        status: string;
        tournamentId: string | null;
        fromTeamId: string | null;
        toTeamId: string;
        transferFee: number;
        reason: string | null;
        approvedBy: string | null;
        requestedAt: Date;
        resolvedAt: Date | null;
    }>;
}
