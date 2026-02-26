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
        countryCode?: string;
        otp?: string;
        district?: string;
        state?: string;
        country?: string;
        heightCm?: number;
        gender?: string;
        avatar?: string;
    }) {
        // Enforce Mandatory OTP Verification if phone is provided
        if (dto.phone) {
            if (!dto.otp) {
                throw new UnauthorizedException('OTP is required for phone verification.');
            }
            const storedOtp = this.otps.get(dto.phone);
            if (!storedOtp || storedOtp !== dto.otp) {
                throw new UnauthorizedException('Invalid or expired OTP.');
            }
            // Clear OTP after successful use
            this.otps.delete(dto.phone);
        }

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
                countryCode: dto.countryCode || undefined,
                avatar: dto.avatar || undefined,
                isVerified: !!dto.phone, // Auto-verify if they passed phone OTP phase successfully
            },
        });

        // Add Demographic fields if role supports advanced profiles
        if (user.role === 'PLAYER' || user.role === 'TEAM_MANAGER' || user.role === 'OFFICIAL') {
            const sportsId = `GS-${Date.now()}-${Math.random().toString(36).substring(2, 8).toUpperCase()}`;
            await this.prisma.player.create({
                data: {
                    userId: user.id,
                    sportsId,
                    district: dto.district || undefined,
                    state: dto.state || undefined,
                    country: dto.country || 'India',
                    heightCm: dto.heightCm || undefined,
                    gender: dto.gender || undefined,
                },
            });
        }

        // Fetch the fully populated user to mirror the login payload
        const populatedUser = await this.prisma.user.findUnique({
            where: { id: user.id },
            include: {
                player: {
                    include: { playerSports: { include: { sport: true } } }
                }
            },
        });

        const token = this.generateToken(user);
        return {
            user: this.sanitizeUser(populatedUser),
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

    async sendEmailVerification(userId: string) {
        const user = await this.prisma.user.findUnique({ where: { id: userId } });
        if (!user) throw new UnauthorizedException('User not found');
        if (user.isEmailVerified) return { message: 'Email already verified' };

        const verifyToken = this.jwtService.sign(
            { sub: user.id, purpose: 'email_verify' },
            { expiresIn: '24h' }
        );

        // In production, integrate with SendGrid/AWS SES
        console.log(`\n======================================`);
        console.log(`📧 [DEV] EMAIL MOCK to ${user.email}:`);
        console.log(`Click to verify: http://localhost:3000/api/auth/verify-email?token=${verifyToken}`);
        console.log(`======================================\n`);

        return { message: 'Verification email sent' };
    }

    async verifyEmail(token: string) {
        try {
            const decoded = this.jwtService.verify(token);
            if (decoded.purpose !== 'email_verify') throw new Error('Invalid token type');

            await this.prisma.user.update({
                where: { id: decoded.sub },
                data: { isEmailVerified: true }
            });

            return { message: 'Email successfully verified' };
        } catch (e) {
            throw new UnauthorizedException('Invalid or expired verification link');
        }
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
