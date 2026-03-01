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
        if (role === 'ORGANIZER') rolePrefix = 'OR';
        else if (role === 'OFFICIAL') rolePrefix = 'OF';

        const prefix = SPORT_PREFIXES[sport.name] || sport.name.substring(0, 3).toUpperCase();

        // Generate unique code: rolePrefix + sport prefix + - + 5-digit random number
        let sportCode = '';
        for (let i = 0; i < 10; i++) {
            const num = Math.floor(10000 + Math.random() * 90000);
            const code = `${rolePrefix}${prefix}-${num}`;
            const exists = await this.prisma.playerSport.findUnique({ where: { sportCode: code } });
            if (!exists) {
                sportCode = code;
                break;
            }
        }
        if (!sportCode) {
            // Fallback to timestamp if random collisions happen 10 times
            sportCode = `${rolePrefix}${prefix}-${Date.now().toString().slice(-5)}`;
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
