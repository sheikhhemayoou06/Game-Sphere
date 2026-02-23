import { NotificationsService } from './notifications.service';
export declare class NotificationsController {
    private readonly notificationsService;
    constructor(notificationsService: NotificationsService);
    getNotifications(req: any, unreadOnly?: string): Promise<{
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
    getUnreadCount(req: any): Promise<number>;
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
    markAllAsRead(req: any): Promise<import(".prisma/client").Prisma.BatchPayload>;
    createNotification(body: any): Promise<{
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
