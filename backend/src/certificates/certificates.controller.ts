import { Controller, Get, Post, Query, Body, Param, UseGuards } from '@nestjs/common';
import { CertificatesService } from './certificates.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('certificates')
export class CertificatesController {
    constructor(private certificatesService: CertificatesService) { }

    @Get()
    getAll(
        @Query('tournamentId') tournamentId?: string,
        @Query('playerId') playerId?: string,
        @Query('type') type?: string,
    ) {
        return this.certificatesService.getAll(tournamentId, playerId, type);
    }

    @Get('verify/:code')
    verify(@Param('code') code: string) {
        return this.certificatesService.verify(code);
    }

    @Get(':id')
    getById(@Param('id') id: string) {
        return this.certificatesService.getById(id);
    }

    @UseGuards(JwtAuthGuard)
    @Post()
    generate(@Body() data: any) {
        return this.certificatesService.generate(data);
    }

    @UseGuards(JwtAuthGuard)
    @Post('bulk')
    generateBulk(@Body() data: { tournamentId: string; tournamentName: string; sportName: string; participants: any[] }) {
        return this.certificatesService.generateBulk(data.tournamentId, data.tournamentName, data.sportName, data.participants);
    }
}
