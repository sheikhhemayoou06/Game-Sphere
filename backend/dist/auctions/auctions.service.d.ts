import { PrismaService } from '../prisma/prisma.service';
export declare class AuctionsService {
    private prisma;
    constructor(prisma: PrismaService);
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
                district: string | null;
                state: string | null;
                country: string;
                primarySport: string | null;
                bio: string | null;
                heightCm: number | null;
                weightKg: number | null;
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
    startBidding(auctionPlayerId: string): Promise<{
        id: string;
        createdAt: Date;
        status: string;
        playerId: string;
        auctionId: string;
        basePrice: number;
        soldPrice: number | null;
        soldToTeamId: string | null;
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
