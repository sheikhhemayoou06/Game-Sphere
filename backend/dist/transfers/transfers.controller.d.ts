import { TransfersService } from './transfers.service';
export declare class TransfersController {
    private transfersService;
    constructor(transfersService: TransfersService);
    getAll(status?: string): Promise<{
        id: string;
        status: string;
        tournamentId: string | null;
        playerId: string;
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
        status: string;
        tournamentId: string | null;
        playerId: string;
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
        status: string;
        tournamentId: string | null;
        playerId: string;
        fromTeamId: string | null;
        toTeamId: string;
        transferFee: number;
        reason: string | null;
        approvedBy: string | null;
        requestedAt: Date;
        resolvedAt: Date | null;
    } | null>;
    requestTransfer(data: any): Promise<{
        id: string;
        status: string;
        tournamentId: string | null;
        playerId: string;
        fromTeamId: string | null;
        toTeamId: string;
        transferFee: number;
        reason: string | null;
        approvedBy: string | null;
        requestedAt: Date;
        resolvedAt: Date | null;
    }>;
    approveTransfer(id: string, req: any): Promise<{
        id: string;
        status: string;
        tournamentId: string | null;
        playerId: string;
        fromTeamId: string | null;
        toTeamId: string;
        transferFee: number;
        reason: string | null;
        approvedBy: string | null;
        requestedAt: Date;
        resolvedAt: Date | null;
    }>;
    rejectTransfer(id: string, req: any): Promise<{
        id: string;
        status: string;
        tournamentId: string | null;
        playerId: string;
        fromTeamId: string | null;
        toTeamId: string;
        transferFee: number;
        reason: string | null;
        approvedBy: string | null;
        requestedAt: Date;
        resolvedAt: Date | null;
    }>;
}
