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
        // Phone verification removed as per new email-first verification plan

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
        let user = await this.prisma.user.findUnique({
            where: { email: dto.email },
            include: {
                player: {
                    include: { playerSports: { include: { sport: true } } }
                }
            },
        });

        // 🚀 HOTFIX: Auto-sync orphaned Supabase accounts
        // If Supabase authentication succeeded on the frontend but Prisma failed during signup, 
        // the user's login hits this endpoint and throws 'Invalid Credentials' because they 
        // don't exist in our custom database. We will auto-create them right here.
        if (!user) {
            const hashedPassword = await bcrypt.hash(dto.password, 10);
            const sportsId = `GS-${Date.now()}-${Math.random().toString(36).substring(2, 8).toUpperCase()}`;
            user = await this.prisma.user.create({
                data: {
                    email: dto.email,
                    password: hashedPassword,
                    firstName: 'Player',
                    lastName: '',
                    role: 'PLAYER',
                    player: {
                        create: {
                            sportsId,
                            country: 'India'
                        }
                    }
                },
                include: {
                    player: {
                        include: { playerSports: { include: { sport: true } } }
                    }
                }
            });
        } else {
            const isPasswordValid = await bcrypt.compare(dto.password, user.password);
            if (!isPasswordValid) {
                throw new UnauthorizedException('Invalid credentials');
            }
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

    async updateProfile(userId: string, data: any) {
        const { name, phone, email, district, state, country, height, weight, gender } = data;

        let firstName, lastName;
        if (name) {
            const parts = name.trim().split(' ');
            firstName = parts[0];
            lastName = parts.slice(1).join(' ');
        }

        const userUpdate: any = {};
        if (firstName) userUpdate.firstName = firstName;
        if (lastName !== undefined) userUpdate.lastName = lastName;
        if (phone) userUpdate.phone = phone;
        if (email) userUpdate.email = email;

        if (Object.keys(userUpdate).length > 0) {
            await this.prisma.user.update({
                where: { id: userId },
                data: userUpdate,
            });
        }

        const playerUpdate: any = {};
        if (district) playerUpdate.district = district;
        if (state) playerUpdate.state = state;
        if (country) playerUpdate.country = country;
        if (height) playerUpdate.heightCm = parseInt(height.toString().replace(/[^0-9]/g, '')) || null;
        if (weight) playerUpdate.weightKg = parseInt(weight.toString().replace(/[^0-9]/g, '')) || null;
        if (gender) playerUpdate.gender = gender;

        if (Object.keys(playerUpdate).length > 0) {
            await this.prisma.player.update({
                where: { userId },
                data: playerUpdate,
            });
        }

        return this.getProfile(userId);
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
