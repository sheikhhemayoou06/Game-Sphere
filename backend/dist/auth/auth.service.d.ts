import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../prisma/prisma.service';
export declare class AuthService {
    private prisma;
    private jwtService;
    private otps;
    constructor(prisma: PrismaService, jwtService: JwtService);
    register(dto: {
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
    }): Promise<{
        user: any;
        accessToken: string;
    }>;
    login(dto: {
        email: string;
        password: string;
    }): Promise<{
        user: any;
        accessToken: string;
    }>;
    sendOtp({ phone }: {
        phone: string;
    }): Promise<{
        message: string;
    }>;
    verifyOtp({ phone, otp }: {
        phone: string;
        otp: string;
    }): Promise<{
        user: any;
        accessToken: string;
    }>;
    sendEmailVerification(userId: string): Promise<{
        message: string;
    }>;
    verifyEmail(token: string): Promise<{
        message: string;
    }>;
    getProfile(userId: string): Promise<any>;
    updateProfile(userId: string, data: any): Promise<any>;
    private generateToken;
    private sanitizeUser;
}
