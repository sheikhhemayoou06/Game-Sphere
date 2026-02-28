import { PrismaService } from '../prisma/prisma.service';
export declare class CertificatesService {
    private prisma;
    constructor(prisma: PrismaService);
    getAll(tournamentId?: string, playerId?: string, type?: string): Promise<{
        id: string;
        playerId: string | null;
        metadata: string | null;
        tournamentId: string | null;
        teamId: string | null;
        type: string;
        recipientName: string;
        sportName: string | null;
        tournamentName: string | null;
        position: string | null;
        verificationCode: string;
        issuedAt: Date;
    }[]>;
    getById(id: string): Promise<{
        id: string;
        playerId: string | null;
        metadata: string | null;
        tournamentId: string | null;
        teamId: string | null;
        type: string;
        recipientName: string;
        sportName: string | null;
        tournamentName: string | null;
        position: string | null;
        verificationCode: string;
        issuedAt: Date;
    } | null>;
    verify(code: string): Promise<{
        valid: boolean;
        certificate: {
            id: string;
            playerId: string | null;
            metadata: string | null;
            tournamentId: string | null;
            teamId: string | null;
            type: string;
            recipientName: string;
            sportName: string | null;
            tournamentName: string | null;
            position: string | null;
            verificationCode: string;
            issuedAt: Date;
        };
    } | {
        valid: boolean;
        certificate?: undefined;
    }>;
    generate(data: {
        type: string;
        recipientName: string;
        playerId?: string;
        teamId?: string;
        tournamentId?: string;
        sportName?: string;
        tournamentName?: string;
        position?: string;
    }): Promise<{
        id: string;
        playerId: string | null;
        metadata: string | null;
        tournamentId: string | null;
        teamId: string | null;
        type: string;
        recipientName: string;
        sportName: string | null;
        tournamentName: string | null;
        position: string | null;
        verificationCode: string;
        issuedAt: Date;
    }>;
    generateBulk(tournamentId: string, tournamentName: string, sportName: string, participants: {
        name: string;
        playerId?: string;
        position?: string;
    }[]): Promise<{
        id: string;
        playerId: string | null;
        metadata: string | null;
        tournamentId: string | null;
        teamId: string | null;
        type: string;
        recipientName: string;
        sportName: string | null;
        tournamentName: string | null;
        position: string | null;
        verificationCode: string;
        issuedAt: Date;
    }[]>;
}
