import { Module } from '@nestjs/common';
import { AuctionsService } from './auctions.service';
import { AuctionsController, AuctionsDirectController } from './auctions.controller';
import { PrismaModule } from '../prisma/prisma.module';
import { NotificationsModule } from '../notifications/notifications.module';

@Module({
    imports: [PrismaModule, NotificationsModule],
    controllers: [AuctionsController, AuctionsDirectController],
    providers: [AuctionsService],
    exports: [AuctionsService],
})
export class AuctionsModule { }


