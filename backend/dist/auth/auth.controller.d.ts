import { AuthService } from './auth.service';
export declare class AuthController {
    private authService;
    constructor(authService: AuthService);
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
    sendOtp(dto: {
        phone: string;
    }): Promise<{
        message: string;
    }>;
    verifyOtp(dto: {
        phone: string;
        otp: string;
    }): Promise<{
        user: any;
        accessToken: string;
    }>;
    getProfile(req: any): Promise<any>;
}
