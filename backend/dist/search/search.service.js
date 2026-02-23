"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.SearchService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
let SearchService = class SearchService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async globalSearch(query, sportId) {
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
        const searchCondition = { contains: searchStr };
        const sportFilter = sportId && sportId !== 'ALL' ? sportId : undefined;
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
};
exports.SearchService = SearchService;
exports.SearchService = SearchService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], SearchService);
//# sourceMappingURL=search.service.js.map