import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../prisma/prisma.service';
export declare class AuthService {
    private prisma;
    private jwtService;
    constructor(prisma: PrismaService, jwtService: JwtService);
    register(dto: {
        email: string;
        password: string;
        firstName: string;
        lastName: string;
        role?: string;
        phone?: string;
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
    getProfile(userId: string): Promise<any>;
    private generateToken;
    private sanitizeUser;
}
