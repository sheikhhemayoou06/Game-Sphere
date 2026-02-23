import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class SearchService {
    constructor(private prisma: PrismaService) { }

    async globalSearch(query: string, sportId?: string) {
        // Return early if no search query
        if (!query || query.trim().length < 2) {
            return {
                liveMatches: [],
                completedMatches: [],
                tournaments: [],
                teams: [],
                players: [],
            };
        }

        const searchStr = query.trim();
        // Allow partial matching anywhere in the string
        const searchCondition = { contains: searchStr };

        // Common sport filter condition
        const sportFilter = sportId && sportId !== 'ALL' ? sportId : undefined;

        // 1. Search Matches (Live and Completed)
        const matches = await this.prisma.match.findMany({
            where: {
                AND: [
                    sportFilter ? { sportId: sportFilter } : {},
                    {
                        OR: [
                            { homeTeam: { name: searchCondition } },
                            { awayTeam: { name: searchCondition } },
                            { tournament: { name: searchCondition } },
                        ],
                    },
                ]
            },
            include: {
                homeTeam: true,
                awayTeam: true,
                tournament: { select: { name: true, id: true, sportId: true } },
                sport: { select: { name: true, icon: true } },
            },
            take: 20,
        });

        const liveMatches = matches.filter(m => m.status === 'LIVE' || m.status === 'IN_PROGRESS');
        const completedMatches = matches.filter(m => m.status === 'COMPLETED');

        // 2. Search Tournaments
        const tournaments = await this.prisma.tournament.findMany({
            where: {
                AND: [
                    sportFilter ? { sportId: sportFilter } : {},
                    { name: searchCondition },
                ]
            },
            include: {
                sport: { select: { name: true, icon: true } },
            },
            take: 10,
        });

        // 3. Search Teams
        const teams = await this.prisma.team.findMany({
            where: {
                AND: [
                    sportFilter ? { sportId: sportFilter } : {},
                    { name: searchCondition },
                ]
            },
            include: {
                sport: { select: { name: true, icon: true } },
            },
            take: 10,
        });

        // 4. Search Players
        // Player schema doesn't have a direct sportId, it links to User, and has 'primarySport'.
        // If sportFilter exists, we either skip checking primarySport or do a best-effort text match.
        // Usually sports filters apply to specific tournament/team views. Here, user searches globally.
        // If a sport ID is provided, we can lookup the sport name to filter by primarySport.

        let playerSportCondition = {};
        if (sportFilter) {
            const sport = await this.prisma.sport.findUnique({ where: { id: sportFilter } });
            if (sport) {
                playerSportCondition = { primarySport: { contains: sport.name } };
            }
        }

        const players = await this.prisma.player.findMany({
            where: {
                AND: [
                    playerSportCondition,
                    {
                        user: {
                            OR: [
                                { firstName: searchCondition },
                                { lastName: searchCondition },
                                // Allow searching by full name implicitly by splitting? 
                                // A bit complex in Prisma SQLite, we rely on contains for now.
                            ],
                        },
                    },
                ]
            },
            include: {
                user: { select: { firstName: true, lastName: true, avatar: true } },
            },
            take: 10,
        });

        return {
            liveMatches,
            completedMatches,
            tournaments,
            teams,
            players,
        };
    }
}
