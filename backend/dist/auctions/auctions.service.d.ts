import { PrismaService } from '../prisma/prisma.service';
export declare class AuctionsService {
    private prisma;
    constructor(prisma: PrismaService);
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
    updateAuctionStatus(auctionId: string, status: string): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        status: string;
        tournamentId: string;
        teamBudget: number;
    }>;
    addPlayerToAuction(auctionId: string, playerId: string, basePrice?: number): Promise<{
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
    startBidding(auctionPlayerId: string): Promise<{
        id: string;
        createdAt: Date;
        status: string;
        playerId: string;
        basePrice: number;
        soldPrice: number | null;
        soldToTeamId: string | null;
        auctionId: string;
    }>;
    placeBid(auctionPlayerId: string, teamId: string, amount: number): Promise<{
        id: string;
        createdAt: Date;
        teamId: string;
        amount: number;
        auctionPlayerId: string;
    }>;
    sellPlayer(auctionPlayerId: string, teamId: string, soldPrice: number): Promise<{
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
