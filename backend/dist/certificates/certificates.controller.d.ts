import { CertificatesService } from './certificates.service';
export declare class CertificatesController {
    private certificatesService;
    constructor(certificatesService: CertificatesService);
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
    generate(data: any): Promise<{
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
    generateBulk(data: {
        tournamentId: string;
        tournamentName: string;
        sportName: string;
        participants: any[];
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
    }[]>;
}
