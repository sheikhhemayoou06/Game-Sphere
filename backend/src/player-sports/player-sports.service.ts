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

        const prefix = SPORT_PREFIXES[sport.name] || sport.name.substring(0, 3).toUpperCase();
        const year = new Date().getFullYear();

        // Count existing registrations for this sport to generate sequential number
        const count = await this.prisma.playerSport.count({ where: { sportId } });
        const seq = String(count + 1).padStart(5, '0');

        const sportCode = `${prefix}-${year}-${seq}`;

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
