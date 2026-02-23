import { Controller, Get, Post, Put, Query, Body, Param, UseGuards, Request } from '@nestjs/common';
import { TransfersService } from './transfers.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('transfers')
export class TransfersController {
    constructor(private transfersService: TransfersService) { }

    @Get()
    getAll(@Query('status') status?: string) {
        return this.transfersService.getAll(status);
    }

    @Get('player/:playerId')
    getByPlayer(@Param('playerId') playerId: string) {
        return this.transfersService.getByPlayer(playerId);
    }

    @Get(':id')
    getById(@Param('id') id: string) {
        return this.transfersService.getById(id);
    }

    @UseGuards(JwtAuthGuard)
    @Post()
    requestTransfer(@Body() data: any) {
        return this.transfersService.requestTransfer(data);
    }

    @UseGuards(JwtAuthGuard)
    @Put(':id/approve')
    approveTransfer(@Param('id') id: string, @Request() req: any) {
        return this.transfersService.approveTransfer(id, req.user.sub);
    }

    @UseGuards(JwtAuthGuard)
    @Put(':id/reject')
    rejectTransfer(@Param('id') id: string, @Request() req: any) {
        return this.transfersService.rejectTransfer(id, req.user.sub);
    }
}
