import { Injectable, UnauthorizedException, ConflictException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class AuthService {
    private otps = new Map<string, string>();

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
                phone: dto.phone || undefined,
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
            include: {
                player: {
                    include: { playerSports: { include: { sport: true } } }
                }
            },
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

    async sendOtp({ phone }: { phone: string }) {
        // Generate a 6-digit OTP
        const otp = Math.floor(100000 + Math.random() * 900000).toString();
        this.otps.set(phone, otp);

        // In production, integrate with SMS gateway (Twilio, AWS SNS, etc.)
        console.log(`\n======================================`);
        console.log(`💬 [DEV] SMS MOCK: OTP for ${phone} is ${otp}`);
        console.log(`======================================\n`);

        return { message: 'OTP sent successfully' };
    }

    async verifyOtp({ phone, otp }: { phone: string; otp: string }) {
        const storedOtp = this.otps.get(phone);
        if (!storedOtp || storedOtp !== otp) {
            throw new UnauthorizedException('Invalid or expired OTP');
        }

        this.otps.delete(phone);

        let user = await this.prisma.user.findFirst({
            where: { phone },
        });

        if (!user) {
            const dummyEmail = `${phone}_${Date.now()}@gamesphere.fan`;
            const dummyPassword = await bcrypt.hash(Math.random().toString(), 10);
            user = await this.prisma.user.create({
                data: {
                    email: dummyEmail,
                    password: dummyPassword,
                    firstName: 'Fan',
                    lastName: '',
                    phone: phone,
                    role: 'GENERAL_USER',
                },
            });
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
            include: {
                player: {
                    include: { playerSports: { include: { sport: true } } }
                }
            },
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
