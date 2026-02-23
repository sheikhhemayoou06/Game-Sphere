import { AuctionsService } from './auctions.service';
export declare class AuctionsController {
    private auctionsService;
    constructor(auctionsService: AuctionsService);
    getAuction(tournamentId: string): Promise<({
        players: ({
            bids: {
                id: string;
                createdAt: Date;
                teamId: string;
                amount: number;
                auctionPlayerId: string;
            }[];
        } & {
            id: string;
            createdAt: Date;
            status: string;
            playerId: string;
            basePrice: number;
            soldPrice: number | null;
            soldToTeamId: string | null;
            auctionId: string;
        })[];
    } & {
        id: string;
        createdAt: Date;
        updatedAt: Date;
        status: string;
        tournamentId: string;
        teamBudget: number;
    }) | null>;
    createAuction(tournamentId: string, teamBudget?: number): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        status: string;
        tournamentId: string;
        teamBudget: number;
    }>;
    updateStatus(auctionId: string, status: string): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        status: string;
        tournamentId: string;
        teamBudget: number;
    }>;
    addPlayer(auctionId: string, body: {
        playerId: string;
        basePrice?: number;
    }): Promise<{
        id: string;
        createdAt: Date;
        status: string;
        playerId: string;
        basePrice: number;
        soldPrice: number | null;
        soldToTeamId: string | null;
        auctionId: string;
    }>;
    approvePlayer(auctionPlayerId: string): Promise<{
        id: string;
        createdAt: Date;
        status: string;
        playerId: string;
        basePrice: number;
        soldPrice: number | null;
        soldToTeamId: string | null;
        auctionId: string;
    }>;
    placeBid(apId: string, body: {
        teamId: string;
        amount: number;
    }): Promise<{
        id: string;
        createdAt: Date;
        teamId: string;
        amount: number;
        auctionPlayerId: string;
    }>;
    sellPlayer(apId: string, body: {
        teamId: string;
        soldPrice: number;
    }): Promise<{
        id: string;
        createdAt: Date;
        status: string;
        playerId: string;
        basePrice: number;
        soldPrice: number | null;
        soldToTeamId: string | null;
        auctionId: string;
    }>;
    markUnsold(auctionPlayerId: string): Promise<{
        id: string;
        createdAt: Date;
        status: string;
        playerId: string;
        basePrice: number;
        soldPrice: number | null;
        soldToTeamId: string | null;
        auctionId: string;
    }>;
}
