// Sport accent colors from design doc
export const sportColors: Record<string, string> = {
    Cricket: '#0D9488',
    Football: '#16A34A',
    Basketball: '#EA580C',
    Kabaddi: '#F97316',
    Volleyball: '#7C3AED',
    Badminton: '#06B6D4',
    Hockey: '#2563EB',
    Tennis: '#84CC16',
    Athletics: '#EAB308',
};

export const sportIcons: Record<string, string> = {
    Cricket: '🏏',
    Football: '⚽',
    Basketball: '🏀',
    Kabaddi: '🤼',
    Volleyball: '🏐',
    Badminton: '🏸',
    Hockey: '🏑',
    Tennis: '🎾',
    Athletics: '🏃',
};

export const roleLabels: Record<string, string> = {
    SUPER_ADMIN: 'Super Admin',
    STATE_ADMIN: 'State Admin',
    DISTRICT_ADMIN: 'District Admin',
    ORGANIZER: 'Tournament Organizer',
    TEAM_MANAGER: 'Team Manager',
    PLAYER: 'Player',
    OFFICIAL: 'Official / Referee',
};

export const statusColors: Record<string, string> = {
    DRAFT: '#6B7280',
    REGISTRATION: '#3B82F6',
    VERIFICATION: '#F59E0B',
    FIXTURES: '#8B5CF6',
    LIVE: '#EF4444',
    COMPLETED: '#10B981',
    ARCHIVED: '#9CA3AF',
    SCHEDULED: '#3B82F6',
    PENDING: '#F59E0B',
    APPROVED: '#10B981',
    REJECTED: '#EF4444',
};

export function cn(...classes: (string | undefined | false)[]) {
    return classes.filter(Boolean).join(' ');
}

export function formatDate(date: string | Date) {
    return new Date(date).toLocaleDateString('en-IN', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
    });
}

export const sportConfig: Record<string, { positions: string[], stat: string, secondaryStat: string, emoji: string, events: { type: string, label: string }[] }> = {
    Cricket: {
        positions: ['All', 'Batsman', 'Fast Bowler', 'Spinner', 'All-Rounder', 'Wicket-Keeper'], stat: 'Runs', secondaryStat: 'Wickets', emoji: '🏏',
        events: [{ type: 'WICKET', label: 'Wicket' }, { type: 'SIX', label: 'Six' }, { type: 'FOUR', label: 'Four' }]
    },
    Football: {
        positions: ['All', 'Forward', 'Midfielder', 'Defender', 'Goalkeeper'], stat: 'Goals', secondaryStat: 'Assists', emoji: '⚽',
        events: [{ type: 'YELLOW_CARD', label: 'Yellow Card' }, { type: 'RED_CARD', label: 'Red Card' }, { type: 'SUBSTITUTION', label: 'Sub' }]
    },
    Basketball: {
        positions: ['All', 'Point Guard', 'Shooting Guard', 'Small Forward', 'Power Forward', 'Center'], stat: 'Points', secondaryStat: 'Rebounds', emoji: '🏀',
        events: [{ type: 'FOUL', label: 'Foul' }, { type: 'BLOCK', label: 'Block' }, { type: 'SUBSTITUTION', label: 'Sub' }]
    },
    Kabaddi: {
        positions: ['All', 'Raider', 'Left Cover', 'Right Cover', 'Left Corner', 'Right Corner', 'All-Rounder'], stat: 'Raid Pts', secondaryStat: 'Tackles', emoji: '🤼',
        events: [{ type: 'RAID', label: 'Raid' }, { type: 'TACKLE', label: 'Tackle' }, { type: 'YELLOW_CARD', label: 'Warning' }]
    },
    Tennis: {
        positions: ['All', 'Singles Player', 'Doubles Player'], stat: 'Aces', secondaryStat: 'Winners', emoji: '🎾',
        events: [{ type: 'ACE', label: 'Ace' }, { type: 'SMASH', label: 'Smash' }]
    },
    Badminton: {
        positions: ['All', 'Singles Player', 'Doubles Player'], stat: 'Smashes', secondaryStat: 'Drops', emoji: '🏸',
        events: [{ type: 'SMASH', label: 'Smash' }, { type: 'ACE', label: 'Service Ace' }]
    },
    Athletics: {
        positions: ['All', 'Sprinter', 'Long Distance', 'Thrower', 'Jumper'], stat: 'Medals', secondaryStat: 'Records', emoji: '🏃',
        events: [{ type: 'ACE', label: 'Record' }, { type: 'YELLOW_CARD', label: 'Warning' }]
    },
    Volleyball: {
        positions: ['All', 'Setter', 'Outside Hitter', 'Middle Blocker', 'Libero'], stat: 'Kills', secondaryStat: 'Blocks', emoji: '🏐',
        events: [{ type: 'SMASH', label: 'Spike' }, { type: 'BLOCK', label: 'Block' }, { type: 'ACE', label: 'Service Ace' }]
    },
    Hockey: {
        positions: ['All', 'Forward', 'Midfielder', 'Defender', 'Goalkeeper'], stat: 'Goals', secondaryStat: 'Assists', emoji: '🏑',
        events: [{ type: 'YELLOW_CARD', label: 'Green Card' }, { type: 'RED_CARD', label: 'Yellow Card' }, { type: 'SUBSTITUTION', label: 'Sub' }]
    },
};

export const defaultSportConfig = {
    positions: ['All', 'Player', 'Captain'], stat: 'Score', secondaryStat: 'Action', emoji: '🏅',
    events: [{ type: 'SCORE', label: 'Point' }, { type: 'YELLOW_CARD', label: 'Warning' }]
};
