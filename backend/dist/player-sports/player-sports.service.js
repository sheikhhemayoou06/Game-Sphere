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
exports.PlayerSportsService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
const SPORT_PREFIXES = {
    'Cricket': 'CRI',
    'Football': 'FTB',
    'Basketball': 'BKT',
    'Kabaddi': 'KBD',
    'Volleyball': 'VLB',
    'Badminton': 'BDM',
    'Hockey': 'HKY',
    'Tennis': 'TNS',
    'Athletics': 'ATH',
};
let PlayerSportsService = class PlayerSportsService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async registerForSport(playerId, sportId) {
        const existing = await this.prisma.playerSport.findUnique({
            where: { playerId_sportId: { playerId, sportId } },
        });
        if (existing) {
            throw new common_1.ConflictException('Player already registered for this sport');
        }
        const sport = await this.prisma.sport.findUnique({ where: { id: sportId } });
        if (!sport)
            throw new common_1.NotFoundException('Sport not found');
        const prefix = SPORT_PREFIXES[sport.name] || sport.name.substring(0, 3).toUpperCase();
        const year = new Date().getFullYear();
        const count = await this.prisma.playerSport.count({ where: { sportId } });
        const seq = String(count + 1).padStart(5, '0');
        const sportCode = `${prefix}-${year}-${seq}`;
        return this.prisma.playerSport.create({
            data: { playerId, sportId, sportCode },
            include: { sport: true },
        });
    }
    async getPlayerSports(playerId) {
        return this.prisma.playerSport.findMany({
            where: { playerId },
            include: { sport: true },
            orderBy: { createdAt: 'desc' },
        });
    }
};
exports.PlayerSportsService = PlayerSportsService;
exports.PlayerSportsService = PlayerSportsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], PlayerSportsService);
//# sourceMappingURL=player-sports.service.js.map