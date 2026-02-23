"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AppModule = void 0;
const common_1 = require("@nestjs/common");
const app_controller_1 = require("./app.controller");
const app_service_1 = require("./app.service");
const prisma_module_1 = require("./prisma/prisma.module");
const auth_module_1 = require("./auth/auth.module");
const sports_module_1 = require("./sports/sports.module");
const tournaments_module_1 = require("./tournaments/tournaments.module");
const matches_module_1 = require("./matches/matches.module");
const teams_module_1 = require("./teams/teams.module");
const rankings_module_1 = require("./rankings/rankings.module");
const certificates_module_1 = require("./certificates/certificates.module");
const transfers_module_1 = require("./transfers/transfers.module");
const documents_module_1 = require("./documents/documents.module");
const notifications_module_1 = require("./notifications/notifications.module");
const auctions_module_1 = require("./auctions/auctions.module");
let AppModule = class AppModule {
};
exports.AppModule = AppModule;
exports.AppModule = AppModule = __decorate([
    (0, common_1.Module)({
        imports: [
            prisma_module_1.PrismaModule,
            auth_module_1.AuthModule,
            sports_module_1.SportsModule,
            tournaments_module_1.TournamentsModule,
            matches_module_1.MatchesModule,
            teams_module_1.TeamsModule,
            rankings_module_1.RankingsModule,
            certificates_module_1.CertificatesModule,
            transfers_module_1.TransfersModule,
            documents_module_1.DocumentsModule,
            notifications_module_1.NotificationsModule,
            auctions_module_1.AuctionsModule,
        ],
        controllers: [app_controller_1.AppController],
        providers: [app_service_1.AppService],
    })
], AppModule);
//# sourceMappingURL=app.module.js.map