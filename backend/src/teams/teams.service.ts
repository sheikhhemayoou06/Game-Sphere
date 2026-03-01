import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
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
export class TeamsService {
    constructor(private prisma: PrismaService) { }

    private async generateTeamCode(sportName: string): Promise<string> {
        const prefix = SPORT_PREFIXES[sportName] || sportName.substring(0, 3).toUpperCase();
        // Generate unique code: T + sport prefix + - + 5-digit random number
        for (let i = 0; i < 10; i++) {
            const num = Math.floor(10000 + Math.random() * 90000); // 5-digit: 10000–99999
            const code = `T${prefix}-${num}`;
            const existing = await this.prisma.team.findUnique({ where: { teamCode: code } });
            if (!existing) return code;
        }
        // Fallback: use timestamp
        const ts = Date.now().toString().slice(-5);
        return `T${prefix}-${ts}`;
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

    async findOne(id: string) {
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
        if (!team) throw new NotFoundException('Team not found');
        return team;
    }

    async create(userId: string, data: { name: string; sportId: string; logo?: string; city?: string; state?: string }) {
        // Look up sport name for code generation
        const sport = await this.prisma.sport.findUnique({ where: { id: data.sportId } });
        const sportName = sport?.name || 'GEN';
        const teamCode = await this.generateTeamCode(sportName);

        return this.prisma.team.create({
            data: { ...data, managerId: userId, teamCode },
            include: {
                manager: { select: { id: true, firstName: true, lastName: true } },
                sport: true,
            },
        });
    }

    async update(id: string, userId: string, data: Partial<{ name: string; logo: string; city: string; state: string }>) {
        const team = await this.findOne(id);
        if (team.managerId !== userId) {
            throw new ForbiddenException('Only the team manager can update this team');
        }
        return this.prisma.team.update({ where: { id }, data });
    }

    async addPlayer(teamId: string, playerId: string, jersey?: number, role?: string) {
        return this.prisma.teamPlayer.create({
            data: { teamId, playerId, jersey, role },
            include: {
                player: { include: { user: { select: { firstName: true, lastName: true } } } },
            },
        });
    }

    async removePlayer(teamId: string, playerId: string) {
        return this.prisma.teamPlayer.delete({
            where: { teamId_playerId: { teamId, playerId } },
        });
    }

    async getMyTeams(userId: string, sportId?: string) {
        const where: any = { managerId: userId };
        if (sportId) where.sportId = sportId;

        return this.prisma.team.findMany({
            where,
            include: {
                sport: true,
                _count: { select: { players: true, tournaments: true } },
            },
        });
    }

    async getMySports(userId: string) {
        const teams = await this.prisma.team.findMany({
            where: { managerId: userId },
            select: { sportId: true, sport: true },
            distinct: ['sportId'],
        });
        return teams.map(t => t.sport);
    }
}
