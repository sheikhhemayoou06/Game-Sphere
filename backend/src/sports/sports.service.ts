import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class SportsService {
    constructor(private prisma: PrismaService) { }

    async findAll() {
        return this.prisma.sport.findMany({
            where: { isActive: true },
            orderBy: { name: 'asc' },
        });
    }

    async findOne(id: string) {
        const sport = await this.prisma.sport.findUnique({ where: { id } });
        if (!sport) throw new NotFoundException('Sport not found');
        return sport;
    }

    async create(data: {
        name: string;
        icon?: string;
        accentColor?: string;
        teamSize?: number;
        maxPlayers?: number;
        scoringRules?: any;
        statFields?: any;
        matchDuration?: string;
        pointsSystem?: any;
        tieBreakerRules?: any;
    }) {
        return this.prisma.sport.create({
            data: {
                ...data,
                scoringRules: data.scoringRules ? JSON.stringify(data.scoringRules) : null,
                statFields: data.statFields ? JSON.stringify(data.statFields) : null,
                pointsSystem: data.pointsSystem ? JSON.stringify(data.pointsSystem) : null,
                tieBreakerRules: data.tieBreakerRules ? JSON.stringify(data.tieBreakerRules) : null,
            },
        });
    }

    async update(id: string, data: Partial<{
        name: string;
        icon: string;
        accentColor: string;
        teamSize: number;
        maxPlayers: number;
        scoringRules: any;
        statFields: any;
        matchDuration: string;
        pointsSystem: any;
        tieBreakerRules: any;
        isActive: boolean;
    }>) {
        await this.findOne(id);
        const updateData: any = { ...data };
        if (data.scoringRules) updateData.scoringRules = JSON.stringify(data.scoringRules);
        if (data.statFields) updateData.statFields = JSON.stringify(data.statFields);
        if (data.pointsSystem) updateData.pointsSystem = JSON.stringify(data.pointsSystem);
        if (data.tieBreakerRules) updateData.tieBreakerRules = JSON.stringify(data.tieBreakerRules);

        return this.prisma.sport.update({ where: { id }, data: updateData });
    }

    async seed() {
        const sports = [
            {
                name: 'Cricket',
                icon: '🏏',
                accentColor: '#0D9488',
                teamSize: 11,
                maxPlayers: 15,
                matchDuration: '20 overs',
                statFields: JSON.stringify(['runs', 'wickets', 'overs', 'extras', 'runRate']),
                scoringRules: JSON.stringify({ type: 'innings', maxInnings: 2 }),
                pointsSystem: JSON.stringify({ win: 2, loss: 0, draw: 1, noResult: 1 }),
            },
            {
                name: 'Football',
                icon: '⚽',
                accentColor: '#16A34A',
                teamSize: 11,
                maxPlayers: 18,
                matchDuration: '90 min',
                statFields: JSON.stringify(['goals', 'assists', 'yellowCards', 'redCards', 'possession', 'shotsOnTarget']),
                scoringRules: JSON.stringify({ type: 'goals', periods: 2 }),
                pointsSystem: JSON.stringify({ win: 3, loss: 0, draw: 1 }),
            },
            {
                name: 'Basketball',
                icon: '🏀',
                accentColor: '#EA580C',
                teamSize: 5,
                maxPlayers: 12,
                matchDuration: '40 min',
                statFields: JSON.stringify(['points', 'rebounds', 'assists', 'steals', 'blocks', 'turnovers']),
                scoringRules: JSON.stringify({ type: 'points', quarters: 4 }),
                pointsSystem: JSON.stringify({ win: 2, loss: 0 }),
            },
            {
                name: 'Kabaddi',
                icon: '🤼',
                accentColor: '#F97316',
                teamSize: 7,
                maxPlayers: 12,
                matchDuration: '40 min',
                statFields: JSON.stringify(['raidPoints', 'tacklePoints', 'superRaids', 'doOrDieRaids', 'allOuts']),
                scoringRules: JSON.stringify({ type: 'points', halves: 2 }),
                pointsSystem: JSON.stringify({ win: 5, loss: 0, draw: 3 }),
            },
            {
                name: 'Volleyball',
                icon: '🏐',
                accentColor: '#7C3AED',
                teamSize: 6,
                maxPlayers: 12,
                matchDuration: 'Best of 5 sets',
                statFields: JSON.stringify(['setsWon', 'attackPercentage', 'blocks', 'aces', 'errors']),
                scoringRules: JSON.stringify({ type: 'sets', maxSets: 5, pointsPerSet: 25 }),
                pointsSystem: JSON.stringify({ win: 3, loss: 0 }),
            },
            {
                name: 'Badminton',
                icon: '🏸',
                accentColor: '#06B6D4',
                teamSize: 1,
                maxPlayers: 2,
                matchDuration: 'Best of 3 games',
                statFields: JSON.stringify(['gamesWon', 'smashes', 'netShots', 'ralliesWon']),
                scoringRules: JSON.stringify({ type: 'games', maxGames: 3, pointsPerGame: 21 }),
                pointsSystem: JSON.stringify({ win: 2, loss: 0 }),
            },
            {
                name: 'Hockey',
                icon: '🏑',
                accentColor: '#2563EB',
                teamSize: 11,
                maxPlayers: 16,
                matchDuration: '60 min',
                statFields: JSON.stringify(['goals', 'assists', 'penaltyCorners', 'saves', 'yellowCards']),
                scoringRules: JSON.stringify({ type: 'goals', quarters: 4 }),
                pointsSystem: JSON.stringify({ win: 3, loss: 0, draw: 1 }),
            },
            {
                name: 'Tennis',
                icon: '🎾',
                accentColor: '#84CC16',
                teamSize: 1,
                maxPlayers: 2,
                matchDuration: 'Best of 3/5 sets',
                statFields: JSON.stringify(['setsWon', 'aces', 'doubleFaults', 'winners', 'unforcedErrors']),
                scoringRules: JSON.stringify({ type: 'sets', maxSets: 5, gamesPerSet: 6 }),
                pointsSystem: JSON.stringify({ win: 2, loss: 0 }),
            },
            {
                name: 'Athletics',
                icon: '🏃',
                accentColor: '#EAB308',
                teamSize: 1,
                maxPlayers: 1,
                matchDuration: 'Event-based',
                statFields: JSON.stringify(['time', 'distance', 'height', 'personalBest']),
                scoringRules: JSON.stringify({ type: 'timed_or_measured' }),
                pointsSystem: JSON.stringify({ gold: 5, silver: 3, bronze: 1 }),
            },
        ];

        for (const sport of sports) {
            await this.prisma.sport.upsert({
                where: { name: sport.name },
                update: sport,
                create: sport,
            });
        }

        return { message: `Seeded ${sports.length} sports successfully` };
    }
}
