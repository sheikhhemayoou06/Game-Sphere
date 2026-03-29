import { Injectable, ConflictException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

const SPORT_PREFIXES: Record<string, string> = {
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

@Injectable()
export class PlayerSportsService {
    constructor(private prisma: PrismaService) { }

    async resolvePlayerId(id: string): Promise<string> {
        const player = await this.prisma.player.findUnique({ where: { id } });
        if (player) return player.id;

        const playerByUser = await this.prisma.player.findUnique({ where: { userId: id } });
        if (playerByUser) return playerByUser.id;

        throw new NotFoundException('Player profile not found for the given ID');
    }

    async registerForSport(id: string, sportId: string, metadata?: any) {
        const actualPlayerId = await this.resolvePlayerId(id);

        // Fetch player with user role
        const player = await this.prisma.player.findUnique({
            where: { id: actualPlayerId },
            include: { user: true },
        });

        if (!player) throw new NotFoundException('Player not found');

        // Check if already registered
        const existing = await this.prisma.playerSport.findUnique({
            where: { playerId_sportId: { playerId: actualPlayerId, sportId } },
        });
        if (existing) {
            throw new ConflictException('Player already registered for this sport');
        }

        // Get sport name for prefix
        const sport = await this.prisma.sport.findUnique({ where: { id: sportId } });
        if (!sport) throw new NotFoundException('Sport not found');

        const role = player.user.role;
        let rolePrefix = 'P'; // Default PLAYER
        if (role === 'ORGANIZER') rolePrefix = 'ORZ';
        else if (role === 'OFFICIAL') rolePrefix = 'OFC';
        else if (role === 'TEAM') rolePrefix = 'TEM';
        else if (role === 'ADMIN') rolePrefix = 'ADM';

        const prefix = SPORT_PREFIXES[sport.name] || sport.name.substring(0, 3).toUpperCase();

        const universalId = player.sportsId || 'USI-Pending';

        let sportCode = '';
        for (let i = 0; i < 10; i++) {
            const dynamicSegment = `${Math.floor(1 + Math.random() * 9)}${String.fromCharCode(65 + Math.floor(Math.random() * 26))}`;
            const code = `${rolePrefix}${prefix}${dynamicSegment}-${universalId}`;
            const exists = await this.prisma.playerSport.findUnique({ where: { sportCode: code } });
            if (!exists) {
                sportCode = code;
                break;
            }
        }
        if (!sportCode) {
            sportCode = `${rolePrefix}${prefix}${Date.now().toString().slice(-2)}-${universalId}`;
        }

        const metadataStr = metadata ? JSON.stringify(metadata) : null;

        return this.prisma.playerSport.create({
            data: { playerId: actualPlayerId, sportId, sportCode, metadata: metadataStr },
            include: { sport: true },
        });
    }

    async getPlayerSports(id: string) {
        let actualPlayerId = id;
        try {
            actualPlayerId = await this.resolvePlayerId(id);
        } catch {
            return []; // Return empty if not found
        }

        return this.prisma.playerSport.findMany({
            where: { playerId: actualPlayerId },
            include: { sport: true },
            orderBy: { createdAt: 'desc' },
        });
    }
}
