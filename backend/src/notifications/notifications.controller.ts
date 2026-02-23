import { Controller, Get, Put, Post, Delete, Param, Query, Body, UseGuards, Request } from '@nestjs/common';
import { NotificationsService } from './notifications.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('notifications')
@UseGuards(JwtAuthGuard)
export class NotificationsController {
    constructor(private readonly notificationsService: NotificationsService) { }

    @Get()
    getNotifications(@Request() req: any, @Query('unreadOnly') unreadOnly?: string) {
        return this.notificationsService.getNotifications(req.user.userId, unreadOnly === 'true');
    }

    @Get('unread-count')
    getUnreadCount(@Request() req: any) {
        return this.notificationsService.getUnreadCount(req.user.userId);
    }

    @Put(':id/read')
    markAsRead(@Param('id') id: string) {
        return this.notificationsService.markAsRead(id);
    }

    @Put('read-all')
    markAllAsRead(@Request() req: any) {
        return this.notificationsService.markAllAsRead(req.user.userId);
    }

    @Post()
    createNotification(@Body() body: any) {
        return this.notificationsService.createNotification(body);
    }

    @Delete(':id')
    deleteNotification(@Param('id') id: string) {
        return this.notificationsService.deleteNotification(id);
    }
}
