import { Injectable, UnauthorizedException, ConflictException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class AuthService {
    constructor(
        private prisma: PrismaService,
        private jwtService: JwtService,
    ) { }

    async register(dto: {
        email: string;
        password: string;
        firstName: string;
        lastName: string;
        role?: string;
        phone?: string;
    }) {
        const existing = await this.prisma.user.findUnique({
            where: { email: dto.email },
        });
        if (existing) {
            throw new ConflictException('Email already registered');
        }

        const hashedPassword = await bcrypt.hash(dto.password, 10);
        const user = await this.prisma.user.create({
            data: {
                email: dto.email,
                password: hashedPassword,
                firstName: dto.firstName,
                lastName: dto.lastName,
                role: dto.role || 'PLAYER',
                phone: dto.phone,
            },
        });

        // If role is PLAYER, auto-create player profile
        if (user.role === 'PLAYER') {
            const sportsId = `GS-${Date.now()}-${Math.random().toString(36).substring(2, 8).toUpperCase()}`;
            await this.prisma.player.create({
                data: {
                    userId: user.id,
                    sportsId,
                },
            });
        }

        const token = this.generateToken(user);
        return {
            user: this.sanitizeUser(user),
            accessToken: token,
        };
    }

    async login(dto: { email: string; password: string }) {
        const user = await this.prisma.user.findUnique({
            where: { email: dto.email },
        });
        if (!user) {
            throw new UnauthorizedException('Invalid credentials');
        }

        const isPasswordValid = await bcrypt.compare(dto.password, user.password);
        if (!isPasswordValid) {
            throw new UnauthorizedException('Invalid credentials');
        }

        const token = this.generateToken(user);
        return {
            user: this.sanitizeUser(user),
            accessToken: token,
        };
    }

    async getProfile(userId: string) {
        const user = await this.prisma.user.findUnique({
            where: { id: userId },
            include: { player: true },
        });
        if (!user) {
            throw new UnauthorizedException('User not found');
        }
        return this.sanitizeUser(user);
    }

    private generateToken(user: { id: string; email: string; role: string }) {
        return this.jwtService.sign({
            sub: user.id,
            email: user.email,
            role: user.role,
        });
    }

    private sanitizeUser(user: any) {
        const { password, ...result } = user;
        return result;
    }
}
