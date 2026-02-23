import { Controller, Get, Post, Put, Param, Body, UseGuards } from '@nestjs/common';
import { SportsService } from './sports.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('sports')
export class SportsController {
    constructor(private sportsService: SportsService) { }

    @Get()
    findAll() {
        return this.sportsService.findAll();
    }

    @Get(':id')
    findOne(@Param('id') id: string) {
        return this.sportsService.findOne(id);
    }

    @UseGuards(JwtAuthGuard)
    @Post()
    create(@Body() data: any) {
        return this.sportsService.create(data);
    }

    @UseGuards(JwtAuthGuard)
    @Put(':id')
    update(@Param('id') id: string, @Body() data: any) {
        return this.sportsService.update(id, data);
    }

    @Post('seed')
    seed() {
        return this.sportsService.seed();
    }
}
