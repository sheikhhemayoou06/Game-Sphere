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
    async login(@Body() dto: { email: string; password: string; rememberMe?: boolean }) {
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

    @Post('forgot-password')
    async forgotPassword(@Body() dto: { email: string }) {
        return this.authService.forgotPassword(dto.email);
    }

    @Post('reset-password')
    async resetPassword(@Body() dto: { token: string; newPassword: string }) {
        return this.authService.resetPassword(dto.token, dto.newPassword);
    }

    @Post('verify-2fa-login')
    async verifyTwoFactorLogin(@Body() dto: { userId: string; token: string; rememberMe?: boolean }) {
        return this.authService.verifyTwoFactorLogin(dto.userId, dto.token, dto.rememberMe);
    }

    @UseGuards(JwtAuthGuard)
    @Post('2fa/generate')
    async generateTwoFactorAuth(@Request() req: any) {
        return this.authService.generateTwoFactorAuthSecret(req.user.sub, req.user.email);
    }

    @UseGuards(JwtAuthGuard)
    @Post('2fa/turn-on')
    async turnOnTwoFactorAuth(@Request() req: any, @Body() dto: { token: string }) {
        return this.authService.turnOnTwoFactorAuth(req.user.sub, dto.token);
    }

    @UseGuards(JwtAuthGuard)
    @Get('profile')
    async getProfile(@Request() req: any) {
        return this.authService.getProfile(req.user.sub);
    }

    @Get('user/:id')
    async getPublicProfile(@Param('id') id: string) {
        return this.authService.getPublicProfile(id);
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
    @UseGuards(JwtAuthGuard)
    @Patch('update-password')
    async updatePassword(@Request() req: any, @Body() dto: any) {
        return this.authService.updatePassword(req.user.sub, dto.currentPassword, dto.newPassword);
    }

    @UseGuards(JwtAuthGuard)
    @Delete('account')
    async deleteAccount(@Request() req: any) {
        return this.authService.deleteAccount(req.user.sub);
    }
}
