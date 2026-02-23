import { PrismaService } from '../prisma/prisma.service';
export declare class SearchService {
    private prisma;
    constructor(prisma: PrismaService);
    globalSearch(query: string, sportId?: string): Promise<{
        liveMatches: ({
            sport: {
                name: string;
                icon: string | null;
            };
            tournament: {
                id: string;
                name: string;
                sportId: string;
            };
            homeTeam: {
                id: string;
                createdAt: Date;
                updatedAt: Date;
                name: string;
                city: string | null;
                state: string | null;
                sportId: string;
                managerId: string;
                logo: string | null;
            } | null;
            awayTeam: {
                id: string;
                createdAt: Date;
                updatedAt: Date;
                name: string;
                city: string | null;
                state: string | null;
                sportId: string;
                managerId: string;
                logo: string | null;
            } | null;
        } & {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            sportId: string;
            status: string;
            venue: string | null;
            matchNumber: number | null;
            tournamentId: string;
            homeTeamId: string | null;
            awayTeamId: string | null;
            winnerTeamId: string | null;
            round: string | null;
            scheduledAt: Date | null;
            scoreData: string | null;
            matchReport: string | null;
        })[];
        completedMatches: ({
            sport: {
                name: string;
                icon: string | null;
            };
            tournament: {
                id: string;
                name: string;
                sportId: string;
            };
            homeTeam: {
                id: string;
                createdAt: Date;
                updatedAt: Date;
                name: string;
                city: string | null;
                state: string | null;
                sportId: string;
                managerId: string;
                logo: string | null;
            } | null;
            awayTeam: {
                id: string;
                createdAt: Date;
                updatedAt: Date;
                name: string;
                city: string | null;
                state: string | null;
                sportId: string;
                managerId: string;
                logo: string | null;
            } | null;
        } & {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            sportId: string;
            status: string;
            venue: string | null;
            matchNumber: number | null;
            tournamentId: string;
            homeTeamId: string | null;
            awayTeamId: string | null;
            winnerTeamId: string | null;
            round: string | null;
            scheduledAt: Date | null;
            scoreData: string | null;
            matchReport: string | null;
        })[];
        tournaments: ({
            sport: {
                name: string;
                icon: string | null;
            };
        } & {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            name: string;
            sportId: string;
            organizerId: string;
            description: string | null;
            level: string;
            format: string;
            status: string;
            maxTeams: number;
            squadSize: number;
            registrationFee: number;
            prizePool: number;
            isRegistrationOpen: boolean;
            registrationEnd: Date | null;
            approvalMode: string;
            maxPurse: number;
            startDate: Date | null;
            endDate: Date | null;
            venue: string | null;
            rules: string | null;
            bannerUrl: string | null;
        })[];
        teams: ({
            sport: {
                name: string;
                icon: string | null;
            };
        } & {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            name: string;
            city: string | null;
            state: string | null;
            sportId: string;
            managerId: string;
            logo: string | null;
        })[];
        players: ({
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
        })[];
    }>;
}
