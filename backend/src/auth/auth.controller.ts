import { Controller, Post, Body, Get, UseGuards, Request, Query, Patch, Delete, Param } from '@nestjs/common';
import { AuthService } from './auth.service';
import { JwtAuthGuard } from './jwt-auth.guard';

@Controller('auth')
export class AuthController {
    constructor(private authService: AuthService) { }

    @Post('register')
    async register(
        @Body() dto: {
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
        },
    ) {
        try {
            return await this.authService.register(dto);
        } catch (error) {
            console.error('\n❌ [REGISTER ERROR] Detailed Stack Trace:');
            console.error(error);
            console.error('----------------------------------------\n');
            throw error;
        }
    }

    @Post('login')
    async login(@Body() dto: { email: string; password: string }) {
        return this.authService.login(dto);
    }

    @Post('send-otp')
    async sendOtp(@Body() dto: { phone: string }) {
        return this.authService.sendOtp(dto);
    }

    @Post('verify-otp')
    async verifyOtp(@Body() dto: { phone: string; otp: string }) {
        return this.authService.verifyOtp(dto);
    }

    @Get('verify-email')
    async verifyEmail(@Query('token') token: string) {
        return this.authService.verifyEmail(token);
    }

    @UseGuards(JwtAuthGuard)
    @Post('send-verification-email')
    async sendVerificationEmail(@Request() req: any) {
        return this.authService.sendEmailVerification(req.user.sub);
    }

    @UseGuards(JwtAuthGuard)
    @Get('profile')
    async getProfile(@Request() req: any) {
        return this.authService.getProfile(req.user.sub);
    }

    @UseGuards(JwtAuthGuard)
    @Patch('profile')
    async updateProfile(@Request() req: any, @Body() dto: any) {
        return this.authService.updateProfile(req.user.sub, dto);
    }

    @UseGuards(JwtAuthGuard)
    @Delete('profile/sports/:sportId')
    async deletePlayerSport(@Request() req: any, @Param('sportId') sportId: string) {
        return this.authService.deletePlayerSport(req.user.sub, sportId);
    }
}
