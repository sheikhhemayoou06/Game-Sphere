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
exports.TeamsService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
let TeamsService = class TeamsService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async findAll() {
        return this.prisma.team.findMany({
            include: {
                manager: { select: { id: true, firstName: true, lastName: true } },
                sport: true,
                _count: { select: { players: true, tournaments: true } },
            },
            orderBy: { name: 'asc' },
        });
    }
    async findOne(id) {
        const team = await this.prisma.team.findUnique({
            where: { id },
            include: {
                manager: { select: { id: true, firstName: true, lastName: true, email: true } },
                sport: true,
                players: {
                    include: {
                        player: {
                            include: { user: { select: { id: true, firstName: true, lastName: true, avatar: true } } },
                        },
                    },
                },
                tournaments: {
                    include: { tournament: { select: { id: true, name: true, status: true } } },
                },
            },
        });
        if (!team)
            throw new common_1.NotFoundException('Team not found');
        return team;
    }
    async create(userId, data) {
        return this.prisma.team.create({
            data: { ...data, managerId: userId },
            include: {
                manager: { select: { id: true, firstName: true, lastName: true } },
                sport: true,
            },
        });
    }
    async update(id, userId, data) {
        const team = await this.findOne(id);
        if (team.managerId !== userId) {
            throw new common_1.ForbiddenException('Only the team manager can update this team');
        }
        return this.prisma.team.update({ where: { id }, data });
    }
    async addPlayer(teamId, playerId, jersey, role) {
        return this.prisma.teamPlayer.create({
            data: { teamId, playerId, jersey, role },
            include: {
                player: { include: { user: { select: { firstName: true, lastName: true } } } },
            },
        });
    }
    async removePlayer(teamId, playerId) {
        return this.prisma.teamPlayer.delete({
            where: { teamId_playerId: { teamId, playerId } },
        });
    }
    async getMyTeams(userId, sportId) {
        const where = { managerId: userId };
        if (sportId)
            where.sportId = sportId;
        return this.prisma.team.findMany({
            where,
            include: {
                sport: true,
                _count: { select: { players: true, tournaments: true } },
            },
        });
    }
    async getMySports(userId) {
        const teams = await this.prisma.team.findMany({
            where: { managerId: userId },
            select: { sportId: true, sport: true },
            distinct: ['sportId'],
        });
        return teams.map(t => t.sport);
    }
};
exports.TeamsService = TeamsService;
exports.TeamsService = TeamsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], TeamsService);
//# sourceMappingURL=teams.service.js.map