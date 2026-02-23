import { CertificatesService } from './certificates.service';
export declare class CertificatesController {
    private certificatesService;
    constructor(certificatesService: CertificatesService);
    getAll(tournamentId?: string, playerId?: string, type?: string): Promise<{
        id: string;
        tournamentId: string | null;
        teamId: string | null;
        playerId: string | null;
        type: string;
        recipientName: string;
        sportName: string | null;
        tournamentName: string | null;
        position: string | null;
        verificationCode: string;
        issuedAt: Date;
        metadata: string | null;
    }[]>;
    verify(code: string): Promise<{
        valid: boolean;
        certificate: {
            id: string;
            tournamentId: string | null;
            teamId: string | null;
            playerId: string | null;
            type: string;
            recipientName: string;
            sportName: string | null;
            tournamentName: string | null;
            position: string | null;
            verificationCode: string;
            issuedAt: Date;
            metadata: string | null;
        };
    } | {
        valid: boolean;
        certificate?: undefined;
    }>;
    getById(id: string): Promise<{
        id: string;
        tournamentId: string | null;
        teamId: string | null;
        playerId: string | null;
        type: string;
        recipientName: string;
        sportName: string | null;
        tournamentName: string | null;
        position: string | null;
        verificationCode: string;
        issuedAt: Date;
        metadata: string | null;
    } | null>;
    generate(data: any): Promise<{
        id: string;
        tournamentId: string | null;
        teamId: string | null;
        playerId: string | null;
        type: string;
        recipientName: string;
        sportName: string | null;
        tournamentName: string | null;
        position: string | null;
        verificationCode: string;
        issuedAt: Date;
        metadata: string | null;
    }>;
    generateBulk(data: {
        tournamentId: string;
        tournamentName: string;
        sportName: string;
        participants: any[];
    }): Promise<{
        id: string;
        tournamentId: string | null;
        teamId: string | null;
        playerId: string | null;
        type: string;
        recipientName: string;
        sportName: string | null;
        tournamentName: string | null;
        position: string | null;
        verificationCode: string;
        issuedAt: Date;
        metadata: string | null;
    }[]>;
}
