import { Controller, Post, Body, Get, UseGuards, Request } from '@nestjs/common';
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
        },
    ) {
        return this.authService.register(dto);
    }

    @Post('login')
    async login(@Body() dto: { email: string; password: string }) {
        return this.authService.login(dto);
    }

    @UseGuards(JwtAuthGuard)
    @Get('profile')
    async getProfile(@Request() req: any) {
        return this.authService.getProfile(req.user.sub);
    }
}
