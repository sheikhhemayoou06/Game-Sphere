import { AuctionsService } from './auctions.service';
export declare class AuctionsController {
    private auctionsService;
    constructor(auctionsService: AuctionsService);
    getAuction(tournamentId: string): Promise<{
        teamPurses: {
            teamId: string;
            teamName: string;
            logo: string | null;
            spent: number;
            remainingPurse: number;
            playersBought: number;
        }[];
        players: ({
            player: {
                user: {
                    firstName: string;
                    lastName: string;
                    avatar: string | null;
                };
            } & {
                id: string;
                createdAt: Date;
                updatedAt: Date;
                sportsId: string;
                dateOfBirth: Date | null;
                gender: string | null;
                city: string | null;
                state: string | null;
                country: string;
                primarySport: string | null;
                bio: string | null;
                totalMatches: number;
                totalWins: number;
                careerStats: string | null;
                userId: string;
            };
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
            auctionId: string;
            basePrice: number;
            soldPrice: number | null;
            soldToTeamId: string | null;
        })[];
        id: string;
        createdAt: Date;
        updatedAt: Date;
        status: string;
        tournamentId: string;
        teamBudget: number;
    } | null>;
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
        auctionId: string;
        basePrice: number;
        soldPrice: number | null;
        soldToTeamId: string | null;
    }>;
    approvePlayer(auctionPlayerId: string): Promise<{
        id: string;
        createdAt: Date;
        status: string;
        playerId: string;
        auctionId: string;
        basePrice: number;
        soldPrice: number | null;
        soldToTeamId: string | null;
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
        auctionId: string;
        basePrice: number;
        soldPrice: number | null;
        soldToTeamId: string | null;
    }>;
    markUnsold(auctionPlayerId: string): Promise<{
        id: string;
        createdAt: Date;
        status: string;
        playerId: string;
        auctionId: string;
        basePrice: number;
        soldPrice: number | null;
        soldToTeamId: string | null;
    }>;
}
