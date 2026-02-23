import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './auth/auth.module';
import { SportsModule } from './sports/sports.module';
import { TournamentsModule } from './tournaments/tournaments.module';
import { MatchesModule } from './matches/matches.module';
import { TeamsModule } from './teams/teams.module';
import { RankingsModule } from './rankings/rankings.module';
import { CertificatesModule } from './certificates/certificates.module';
import { TransfersModule } from './transfers/transfers.module';
import { DocumentsModule } from './documents/documents.module';
import { NotificationsModule } from './notifications/notifications.module';
import { AuctionsModule } from './auctions/auctions.module';

@Module({
  imports: [
    PrismaModule,
    AuthModule,
    SportsModule,
    TournamentsModule,
    MatchesModule,
    TeamsModule,
    RankingsModule,
    CertificatesModule,
    TransfersModule,
    DocumentsModule,
    NotificationsModule,
    AuctionsModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule { }
