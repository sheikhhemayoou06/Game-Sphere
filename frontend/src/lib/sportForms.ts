export type FormField = {
    id: string;
    label: string;
    type: 'select' | 'text' | 'number' | 'file';
    options?: string[];
    placeholder?: string;
};

export const SPORT_FORMS: Record<string, FormField[]> = {
    Cricket: [
        {
            id: 'role',
            label: 'Primary Role',
            type: 'select',
            options: ['Batsman', 'Bowler', 'All-Rounder', 'Wicketkeeper'],
        },
        {
            id: 'battingStyle',
            label: 'Batting Style',
            type: 'select',
            options: ['Right-Handed', 'Left-Handed'],
        },
        {
            id: 'bowlingStyle',
            label: 'Bowling Style (if applicable)',
            type: 'select',
            options: ['None', 'Right-Arm Fast', 'Right-Arm Medium', 'Right-Arm Spin', 'Left-Arm Fast', 'Left-Arm Spin'],
        },
    ],
    Football: [
        {
            id: 'position',
            label: 'Primary Position',
            type: 'select',
            options: ['Forward', 'Midfielder', 'Defender', 'Goalkeeper'],
        },
        {
            id: 'preferredFoot',
            label: 'Preferred Foot',
            type: 'select',
            options: ['Right', 'Left', 'Both'],
        },
    ],
    Basketball: [
        {
            id: 'position',
            label: 'Primary Position',
            type: 'select',
            options: ['Point Guard', 'Shooting Guard', 'Small Forward', 'Power Forward', 'Center'],
        },
        {
            id: 'height',
            label: 'Height (cm) - Optional',
            type: 'number',
            placeholder: 'e.g., 185',
        },
    ],
    Kabaddi: [
        {
            id: 'role',
            label: 'Primary Role',
            type: 'select',
            options: ['Raider', 'Defender', 'All-Rounder'],
        },
        {
            id: 'position',
            label: 'Positioning',
            type: 'select',
            options: ['Left Corner', 'Right Corner', 'Left Cover', 'Right Cover', 'Center'],
        },
    ],
    Volleyball: [
        {
            id: 'position',
            label: 'Primary Position',
            type: 'select',
            options: ['Setter', 'Outside Hitter', 'Opposite Hitter', 'Middle Blocker', 'Libero', 'Defensive Specialist'],
        },
    ],
    Hockey: [
        {
            id: 'position',
            label: 'Position',
            type: 'select',
            options: ['Forward', 'Midfielder', 'Defender', 'Goalkeeper'],
        },
    ],
    TEAM: [
        {
            id: 'teamName',
            label: 'Team Name',
            type: 'text',
            placeholder: 'e.g., Strike Force 11',
        },
        {
            id: 'level',
            label: 'Team Level',
            type: 'select',
            options: ['Club', 'School', 'College', 'District', 'State', 'National'],
        },
        {
            id: 'logo',
            label: 'Team Logo',
            type: 'file',
            placeholder: 'Upload Logo',
        }
    ],
};
