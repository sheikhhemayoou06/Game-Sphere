import { create } from 'zustand';

interface User {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
    role: string;
    phone?: string;
    countryCode?: string;
    avatar?: string;
    isVerified?: boolean;
    isEmailVerified?: boolean;
    isTwoFactorEnabled?: boolean;
    player?: any;
}

interface AuthState {
    user: User | null;
    token: string | null;
    isAuthenticated: boolean;
    setAuth: (user: User, token: string) => void;
    logout: () => void;
    loadFromStorage: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
    user: null,
    token: null,
    isAuthenticated: false,
    setAuth: (user, token) => {
        const currentUserStr = sessionStorage.getItem('user');
        const currentUser = currentUserStr ? JSON.parse(currentUserStr) : null;
        
        // Clear any old session state ONLY if logging in as a completely different user
        if (!currentUser || currentUser.id !== user.id) {
            sessionStorage.removeItem('selectedSportId');
            sessionStorage.removeItem('mySportIds');
            sessionStorage.removeItem('activeTournament');
        }

        sessionStorage.setItem('token', token);
        sessionStorage.setItem('user', JSON.stringify(user));
        set({ user, token, isAuthenticated: true });
    },
    logout: () => {
        sessionStorage.removeItem('token');
        sessionStorage.removeItem('user');
        sessionStorage.removeItem('selectedSportId');
        sessionStorage.removeItem('mySportIds');
        set({ user: null, token: null, isAuthenticated: false });
    },
    loadFromStorage: () => {
        const token = sessionStorage.getItem('token');
        const userStr = sessionStorage.getItem('user');
        if (token && userStr) {
            try {
                const user = JSON.parse(userStr);
                set({ user, token, isAuthenticated: true });
            } catch {
                set({ user: null, token: null, isAuthenticated: false });
            }
        }
    },
}));

/* ═══════════════════════════════════════════════════════════════
   SPORT SELECTION STORE (for multi-sport dashboards)
   ═══════════════════════════════════════════════════════════════ */

interface Sport {
    id: string;
    name: string;
    icon?: string;
    accentColor?: string;
}

interface SportSelectionState {
    selectedSport: Sport | null;
    availableSports: Sport[];
    mySportIds: string[];
    activeTournament: any | null; // NEW: Strict context lock for Organizer
    setSelectedSport: (sport: Sport) => void;
    setAvailableSports: (sports: Sport[]) => void;
    loadSelectedSport: () => string | null;
    addMySport: (sportId: string) => void;
    removeMySport: (sportId: string) => void;
    loadMySportIds: () => string[];
    setActiveTournament: (tournament: any) => void; // NEW
    clearActiveTournament: () => void; // NEW
    loadActiveTournament: () => any | null; // NEW
}

export const useSportStore = create<SportSelectionState>((set, get) => ({
    selectedSport: null,
    availableSports: [],
    mySportIds: [],
    activeTournament: null,
    setSelectedSport: (sport) => {
        sessionStorage.setItem('selectedSportId', sport.id);
        set({ selectedSport: sport, activeTournament: null }); // Clearing tournament when sport changes
    },
    setAvailableSports: (sports) => {
        set({ availableSports: sports });
    },
    loadSelectedSport: () => {
        return sessionStorage.getItem('selectedSportId');
    },
    addMySport: (sportId) => {
        const current = get().mySportIds;
        if (!current.includes(sportId)) {
            const updated = [...current, sportId];
            sessionStorage.setItem('mySportIds', JSON.stringify(updated));
            set({ mySportIds: updated });
        }
    },
    removeMySport: (sportId) => {
        const updated = get().mySportIds.filter(id => id !== sportId);
        sessionStorage.setItem('mySportIds', JSON.stringify(updated));
        set({ mySportIds: updated });
    },
    loadMySportIds: () => {
        try {
            const saved = sessionStorage.getItem('mySportIds');
            const ids = saved ? JSON.parse(saved) : [];
            set({ mySportIds: ids });
            return ids;
        } catch {
            return [];
        }
    },
    setActiveTournament: (tournament) => {
        sessionStorage.setItem('activeTournament', JSON.stringify(tournament));
        set({ activeTournament: tournament });
    },
    clearActiveTournament: () => {
        sessionStorage.removeItem('activeTournament');
        set({ activeTournament: null });
    },
    loadActiveTournament: () => {
        try {
            const saved = sessionStorage.getItem('activeTournament');
            const tournament = saved ? JSON.parse(saved) : null;
            set({ activeTournament: tournament });
            return tournament;
        } catch {
            return null;
        }
    }
}));
