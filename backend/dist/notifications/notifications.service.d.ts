import { PrismaService } from '../prisma/prisma.service';
export declare class NotificationsService {
    private prisma;
    constructor(prisma: PrismaService);
    getNotifications(userId: string, unreadOnly?: boolean): Promise<{
        id: string;
        createdAt: Date;
        userId: string;
        message: string;
        type: string;
        title: string;
        link: string | null;
        read: boolean;
        readAt: Date | null;
    }[]>;
    getUnreadCount(userId: string): Promise<number>;
    markAsRead(id: string): Promise<{
        id: string;
        createdAt: Date;
        userId: string;
        message: string;
        type: string;
        title: string;
        link: string | null;
        read: boolean;
        readAt: Date | null;
    }>;
    markAllAsRead(userId: string): Promise<import(".prisma/client").Prisma.BatchPayload>;
    createNotification(data: {
        userId: string;
        type: string;
        title: string;
        message: string;
        link?: string;
    }): Promise<{
        id: string;
        createdAt: Date;
        userId: string;
        message: string;
        type: string;
        title: string;
        link: string | null;
        read: boolean;
        readAt: Date | null;
    }>;
    deleteNotification(id: string): Promise<{
        id: string;
        createdAt: Date;
        userId: string;
        message: string;
        type: string;
        title: string;
        link: string | null;
        read: boolean;
        readAt: Date | null;
    }>;
}
