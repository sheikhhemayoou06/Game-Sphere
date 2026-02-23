import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class NotificationsService {
    constructor(private prisma: PrismaService) { }

    async getNotifications(userId: string, unreadOnly = false) {
        return this.prisma.notification.findMany({
            where: {
                userId,
                ...(unreadOnly && { read: false }),
            },
            orderBy: { createdAt: 'desc' },
            take: 50,
        });
    }

    async getUnreadCount(userId: string) {
        return this.prisma.notification.count({
            where: { userId, read: false },
        });
    }

    async markAsRead(id: string) {
        return this.prisma.notification.update({
            where: { id },
            data: { read: true, readAt: new Date() },
        });
    }

    async markAllAsRead(userId: string) {
        return this.prisma.notification.updateMany({
            where: { userId, read: false },
            data: { read: true, readAt: new Date() },
        });
    }

    async createNotification(data: {
        userId: string;
        type: string;
        title: string;
        message: string;
        link?: string;
    }) {
        return this.prisma.notification.create({
            data: {
                userId: data.userId,
                type: data.type,
                title: data.title,
                message: data.message,
                link: data.link,
            },
        });
    }

    async deleteNotification(id: string) {
        return this.prisma.notification.delete({ where: { id } });
    }
}
