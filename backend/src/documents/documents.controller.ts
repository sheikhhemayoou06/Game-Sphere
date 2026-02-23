import { Controller, Get, Post, Put, Body, Param, Query, UseGuards, Request } from '@nestjs/common';
import { DocumentsService } from './documents.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('documents')
@UseGuards(JwtAuthGuard)
export class DocumentsController {
    constructor(private readonly documentsService: DocumentsService) { }

    @Get()
    getDocuments(
        @Query('playerId') playerId?: string,
        @Query('type') type?: string,
        @Query('status') status?: string,
    ) {
        return this.documentsService.getDocuments({ playerId, type, status });
    }

    @Get('pending')
    getPending() {
        return this.documentsService.getPendingDocuments();
    }

    @Get('player/:playerId')
    getPlayerDocuments(@Param('playerId') playerId: string) {
        return this.documentsService.getPlayerDocuments(playerId);
    }

    @Get(':id')
    getDocument(@Param('id') id: string) {
        return this.documentsService.getDocument(id);
    }

    @Post()
    createDocument(@Body() body: any, @Request() req: any) {
        return this.documentsService.createDocument({ ...body, uploadedBy: req.user.userId });
    }

    @Put(':id/approve')
    approveDocument(@Param('id') id: string, @Request() req: any) {
        return this.documentsService.approveDocument(id, req.user.userId);
    }

    @Put(':id/reject')
    rejectDocument(@Param('id') id: string, @Body() body: any, @Request() req: any) {
        return this.documentsService.rejectDocument(id, req.user.userId, body.reason);
    }
}
