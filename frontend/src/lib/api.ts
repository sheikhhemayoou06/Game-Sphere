const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api';

async function request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;

    const headers: Record<string, string> = {
        'Content-Type': 'application/json',
        ...((options.headers as Record<string, string>) || {}),
    };

    if (token) {
        headers['Authorization'] = `Bearer ${token}`;
    }

    const res = await fetch(`${API_URL}${endpoint}`, {
        ...options,
        headers,
    });

    if (!res.ok) {
        const error = await res.json().catch(() => ({ message: 'Request failed' }));
        throw new Error(error.message || `HTTP ${res.status}`);
    }

    return res.json();
}

export const api = {
    // Auth
    register: (data: { email: string; password: string; firstName: string; lastName: string; role?: string }) =>
        request<any>('/auth/register', { method: 'POST', body: JSON.stringify(data) }),
    login: (data: { email: string; password: string }) =>
        request<any>('/auth/login', { method: 'POST', body: JSON.stringify(data) }),
    sendOtp: (data: { phone: string }) =>
        request<any>('/auth/send-otp', { method: 'POST', body: JSON.stringify(data) }),
    verifyOtp: (data: { phone: string; otp: string }) =>
        request<any>('/auth/verify-otp', { method: 'POST', body: JSON.stringify(data) }),
    getProfile: () => request<any>('/auth/profile'),

    // Sports
    getSports: () => request<any[]>('/sports'),
    getSport: (id: string) => request<any>(`/sports/${id}`),
    seedSports: () => request<any>('/sports/seed', { method: 'POST' }),

    // Search
    globalSearch: (query: string, sportId?: string) => {
        const params = new URLSearchParams({ q: query });
        if (sportId && sportId !== 'ALL') params.append('sportId', sportId);
        return request<any>(`/search?${params.toString()}`);
    },

    // Tournaments
    getTournaments: (params?: Record<string, string>) => {
        const search = params ? '?' + new URLSearchParams(params).toString() : '';
        return request<any[]>(`/tournaments${search}`);
    },
    getTournament: (id: string) => request<any>(`/tournaments/${id}`),
    createTournament: (data: any) =>
        request<any>('/tournaments', { method: 'POST', body: JSON.stringify(data) }),
    updateTournament: (id: string, data: any) =>
        request<any>(`/tournaments/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
    generateFixtures: (id: string) =>
        request<any>(`/tournaments/${id}/fixtures`, { method: 'POST' }),
    getTournamentStats: (id: string) => request<any>(`/tournaments/${id}/stats`),

    // Matches
    getMatches: (params?: Record<string, string>) => {
        const search = params ? '?' + new URLSearchParams(params).toString() : '';
        return request<any[]>(`/matches${search}`);
    },
    getMatch: (id: string) => request<any>(`/matches/${id}`),
    getLiveMatches: () => request<any[]>('/matches/live'),
    getUpcomingMatches: () => request<any[]>('/matches/upcoming'),
    updateScore: (id: string, scoreData: any) =>
        request<any>(`/matches/${id}/score`, { method: 'PUT', body: JSON.stringify(scoreData) }),

    // Teams
    getTeams: () => request<any[]>('/teams'),
    getTeam: (id: string) => request<any>(`/teams/${id}`),
    getMyTeams: (sportId?: string) => {
        const search = sportId ? `?sportId=${sportId}` : '';
        return request<any[]>(`/teams/my${search}`);
    },
    getMySports: () => request<any[]>('/teams/my-sports'),
    getOwnerDashboard: (sportId: string) => request<any>(`/teams/dashboard?sportId=${sportId}`),
    createTeam: (data: any) =>
        request<any>('/teams', { method: 'POST', body: JSON.stringify(data) }),

    // Rankings
    getRankings: (params?: Record<string, string>) => {
        const search = params ? '?' + new URLSearchParams(params).toString() : '';
        return request<any[]>(`/rankings${search}`);
    },
    getPlayerRankings: (playerId: string) => request<any[]>(`/rankings/player/${playerId}`),
    upsertRanking: (data: any) =>
        request<any>('/rankings', { method: 'POST', body: JSON.stringify(data) }),

    // Certificates
    getCertificates: (params?: Record<string, string>) => {
        const search = params ? '?' + new URLSearchParams(params).toString() : '';
        return request<any[]>(`/certificates${search}`);
    },
    getCertificate: (id: string) => request<any>(`/certificates/${id}`),
    verifyCertificate: (code: string) => request<any>(`/certificates/verify/${code}`),
    generateCertificate: (data: any) =>
        request<any>('/certificates', { method: 'POST', body: JSON.stringify(data) }),

    // Transfers
    getTransfers: (params?: Record<string, string>) => {
        const search = params ? '?' + new URLSearchParams(params).toString() : '';
        return request<any[]>(`/transfers${search}`);
    },
    requestTransfer: (data: any) =>
        request<any>('/transfers', { method: 'POST', body: JSON.stringify(data) }),
    approveTransfer: (id: string) =>
        request<any>(`/transfers/${id}/approve`, { method: 'PUT' }),
    rejectTransfer: (id: string) =>
        request<any>(`/transfers/${id}/reject`, { method: 'PUT' }),

    // Documents
    getDocuments: (params?: Record<string, string>) => {
        const search = params ? '?' + new URLSearchParams(params).toString() : '';
        return request<any[]>(`/documents${search}`);
    },
    getPendingDocuments: () => request<any[]>('/documents/pending'),
    createDocument: (data: any) =>
        request<any>('/documents', { method: 'POST', body: JSON.stringify(data) }),
    approveDocument: (id: string) =>
        request<any>(`/documents/${id}/approve`, { method: 'PUT' }),
    rejectDocument: (id: string, reason?: string) =>
        request<any>(`/documents/${id}/reject`, { method: 'PUT', body: JSON.stringify({ reason }) }),

    // Notifications
    getNotifications: (unreadOnly = false) =>
        request<any[]>(`/notifications${unreadOnly ? '?unreadOnly=true' : ''}`),
    getUnreadCount: () => request<number>('/notifications/unread-count'),
    markNotificationRead: (id: string) =>
        request<any>(`/notifications/${id}/read`, { method: 'PUT' }),
    markAllNotificationsRead: () =>
        request<any>('/notifications/read-all', { method: 'PUT' }),

    // Tournament-scoped APIs
    getTournamentTeams: (id: string) => request<any[]>(`/tournaments/${id}/teams`),
    withdrawTeam: (id: string, teamId: string) =>
        request<any>(`/tournaments/${id}/teams/${teamId}/withdraw`, { method: 'PUT' }),
    approveTeam: (id: string, teamId: string) =>
        request<any>(`/tournaments/${id}/teams/${teamId}/approve`, { method: 'PUT' }),
    rejectTeam: (id: string, teamId: string) =>
        request<any>(`/tournaments/${id}/teams/${teamId}/reject`, { method: 'PUT' }),
    getTournamentFinancials: (id: string) => request<any>(`/tournaments/${id}/financials`),
    getLeaderboard: (id: string) => request<any[]>(`/tournaments/${id}/leaderboard`),

    // Tournament Auction
    getTournamentAuction: (id: string) => request<any>(`/tournaments/${id}/auction`),
    createAuction: (id: string, teamBudget?: number) =>
        request<any>(`/tournaments/${id}/auction`, { method: 'POST', body: JSON.stringify({ teamBudget }) }),
    updateAuctionStatus: (auctionId: string, status: string) =>
        request<any>(`/auctions/${auctionId}/status`, { method: 'PUT', body: JSON.stringify({ status }) }),
    addAuctionPlayer: (auctionId: string, playerId: string, basePrice?: number) =>
        request<any>(`/auctions/${auctionId}/players`, { method: 'POST', body: JSON.stringify({ playerId, basePrice }) }),
    approvePlayer: (auctionPlayerId: string) =>
        request<any>(`/auctions/players/${auctionPlayerId}/approve`, { method: 'PUT' }),
    startBidding: (auctionPlayerId: string) =>
        request<any>(`/auctions/players/${auctionPlayerId}/start`, { method: 'PUT' }),
    sellPlayer: (auctionPlayerId: string, teamId: string, amount: number) =>
        request<any>(`/auctions/players/${auctionPlayerId}/sell`, { method: 'PUT', body: JSON.stringify({ teamId, soldPrice: amount }) }),
    markUnsold: (auctionPlayerId: string) =>
        request<any>(`/auctions/players/${auctionPlayerId}/unsold`, { method: 'PUT' }),
    placeBid: (auctionPlayerId: string, teamId: string, amount: number) =>
        request<any>(`/auctions/players/${auctionPlayerId}/bid`, { method: 'PUT', body: JSON.stringify({ teamId, amount }) }),

    // Tournament Chat
    getTournamentChat: (id: string) => request<any[]>(`/tournaments/${id}/chat`),
    sendChatMessage: (id: string, message: string, type?: string) =>
        request<any>(`/tournaments/${id}/chat`, { method: 'POST', body: JSON.stringify({ message, type }) }),

    // Tournament Media
    getTournamentMedia: (id: string) => request<any[]>(`/tournaments/${id}/media`),
    addTournamentMedia: (id: string, body: { type: string; title: string; description?: string; url: string }) =>
        request<any>(`/tournaments/${id}/media`, { method: 'POST', body: JSON.stringify(body) }),

    // Player Sports (per-sport IDs)
    getPlayerSports: (playerId: string) =>
        request<any[]>(`/players/${playerId}/sports`),
    registerPlayerSport: (playerId: string, sportId: string) =>
        request<any>(`/players/${playerId}/sports`, { method: 'POST', body: JSON.stringify({ sportId }) }),
};
