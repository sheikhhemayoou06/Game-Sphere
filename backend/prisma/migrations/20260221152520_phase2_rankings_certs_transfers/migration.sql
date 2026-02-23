-- CreateTable
CREATE TABLE "Ranking" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "playerId" TEXT,
    "teamId" TEXT,
    "sportId" TEXT NOT NULL,
    "level" TEXT NOT NULL DEFAULT 'DISTRICT',
    "season" TEXT,
    "points" REAL NOT NULL DEFAULT 0,
    "wins" INTEGER NOT NULL DEFAULT 0,
    "losses" INTEGER NOT NULL DEFAULT 0,
    "draws" INTEGER NOT NULL DEFAULT 0,
    "matchesPlayed" INTEGER NOT NULL DEFAULT 0,
    "rank" INTEGER,
    "previousRank" INTEGER,
    "statsData" TEXT,
    "updatedAt" DATETIME NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateTable
CREATE TABLE "Certificate" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "type" TEXT NOT NULL DEFAULT 'PARTICIPATION',
    "recipientName" TEXT NOT NULL,
    "playerId" TEXT,
    "teamId" TEXT,
    "tournamentId" TEXT,
    "sportName" TEXT,
    "tournamentName" TEXT,
    "position" TEXT,
    "verificationCode" TEXT NOT NULL,
    "issuedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "metadata" TEXT
);

-- CreateTable
CREATE TABLE "Transfer" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "playerId" TEXT NOT NULL,
    "fromTeamId" TEXT,
    "toTeamId" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "transferFee" REAL NOT NULL DEFAULT 0,
    "reason" TEXT,
    "approvedBy" TEXT,
    "requestedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "resolvedAt" DATETIME
);

-- CreateIndex
CREATE UNIQUE INDEX "Ranking_playerId_sportId_level_season_key" ON "Ranking"("playerId", "sportId", "level", "season");

-- CreateIndex
CREATE UNIQUE INDEX "Certificate_verificationCode_key" ON "Certificate"("verificationCode");
