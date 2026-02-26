import { create } from 'zustand';

interface User {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
    role: string;
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
        // Clear any old session state that might conflict with the new user
        localStorage.removeItem('selectedSportId');
        localStorage.removeItem('mySportIds');
        localStorage.removeItem('activeTournament');

        localStorage.setItem('token', token);
        localStorage.setItem('user', JSON.stringify(user));
        set({ user, token, isAuthenticated: true });
    },
    logout: () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        localStorage.removeItem('selectedSportId');
        localStorage.removeItem('mySportIds');
        set({ user: null, token: null, isAuthenticated: false });
    },
    loadFromStorage: () => {
        const token = localStorage.getItem('token');
        const userStr = localStorage.getItem('user');
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
        localStorage.setItem('selectedSportId', sport.id);
        set({ selectedSport: sport, activeTournament: null }); // Clearing tournament when sport changes
    },
    setAvailableSports: (sports) => {
        set({ availableSports: sports });
    },
    loadSelectedSport: () => {
        return localStorage.getItem('selectedSportId');
    },
    addMySport: (sportId) => {
        const current = get().mySportIds;
        if (!current.includes(sportId)) {
            const updated = [...current, sportId];
            localStorage.setItem('mySportIds', JSON.stringify(updated));
            set({ mySportIds: updated });
        }
    },
    removeMySport: (sportId) => {
        const updated = get().mySportIds.filter(id => id !== sportId);
        localStorage.setItem('mySportIds', JSON.stringify(updated));
        set({ mySportIds: updated });
    },
    loadMySportIds: () => {
        try {
            const saved = localStorage.getItem('mySportIds');
            const ids = saved ? JSON.parse(saved) : [];
            set({ mySportIds: ids });
            return ids;
        } catch {
            return [];
        }
    },
    setActiveTournament: (tournament) => {
        localStorage.setItem('activeTournament', JSON.stringify(tournament));
        set({ activeTournament: tournament });
    },
    clearActiveTournament: () => {
        localStorage.removeItem('activeTournament');
        set({ activeTournament: null });
    },
    loadActiveTournament: () => {
        try {
            const saved = localStorage.getItem('activeTournament');
            const tournament = saved ? JSON.parse(saved) : null;
            set({ activeTournament: tournament });
            return tournament;
        } catch {
            return null;
        }
    }
}));
