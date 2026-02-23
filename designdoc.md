GAME SPHERE🎨
Multi-Sport India UI/UX Design Document
(Scalable Across All Sports)
1. Design Philosophy
Game Sphere must:
 Feel modern but neutral (not sport-biased)
 Be data-driven
 Adapt dynamically to any sport
 Keep UI consistent across all sports
 Support English + regional languages later
Core Principle:
Structure remains constant.
Sport data changes dynamically.
2. Design System Foundation
Color Strategy🎨
Instead of sport-specific theme, use:
Primary Brand Color
Deep Indigo / Navy (professional & neutral)
Accent Color
Dynamic accent color based on sport category:
 Cricket Teal →
 Football Green →
 Kabaddi Orange →
 Hockey Blue →
 Athletics Yellow →
 Combat sports Red →
Accent changes only in highlights — not entire UI.
Typography🖋
Modern, readable, clean.
Hierarchy:
 H1: Tournament Name
 H2: Match Title
 H3: Section Labels
 Body: Stats
 Micro: Labels, timestamps
Must support Indian multilingual fonts later.
3. Core UI Architecture (Universal Layout)
Game Sphere should follow this structure:
Bottom Navigation
1. Home
2. Matches
3. Tournaments
4. Analytics
5. Profile
Consistent across all sports.
4. Home Screen (Universal)
Purpose:
Overview of user activity.
Sections:
 Ongoing Matches
 Upcoming Matches
 Your Teams
 Your Tournaments
 Performance Snapshot
Sport icon displayed on each card.
5. Universal Match Detail Screen (Most
Important)
This must adapt dynamically per sport.
Example: Cricket🏏
 Scorecard (Runs/Wickets/Overs)
 Batting stats
 Bowling stats
 Fall of wickets
 Run rate graph
Example: Football ⚽
 Score (Goals)
 Timeline (Goals, Cards, Substitutions)
 Possession %
 Shots on target
 Player performance
Example: Kabaddi🤼
 Raid points
 Tackle points
 Super raids
 Do-or-die raids
 Player performance
Example: Volleyball 🏐
 Set scores
 Attack %
 Blocks
 Errors
 Serve points
Universal Match Layout Structure 🔄
Keep structure same:
1. Match Header (Teams + Score)
2. Live Status Indicator
3. Stat Summary Cards
4. Detailed Stats Tabs
5. Timeline Section
6. Player Performance Section
Only stat fields change dynamically.
6. Sport Engine UI Logic
UI must read sport config from backend.
Example:
JSON{
"sport": "cricket",
"stat_fields": ["runs", "wickets", "overs"],
"format": "limited_overs"
}
Frontend renders dynamically.
This makes platform future-proof.
7. Tournament Screen
Common for all sports:
 Tournament banner
 Format (League/Knockout)
 Points table
 Fixtures
 Teams
 Rules
8. Leaderboard Screen
Universal ranking format:
 Rank
 Team/Player
 Matches
 Wins
 Points
 Performance Index
For individual sports (Athletics, Wrestling):
 Medal table
 Time/Score ranking
9. Player Profile (Universal Sports ID UI)
Sections:
 Player photo
 Primary sport
 Career stats
 Recent matches
 Achievements
 Certificates
Must support multi-sport players.
10. Analytics Screen (Multi-Sport)
Tabs:
 Performance trends
 Win ratio
 Heatmaps (future)
 Comparison view
Comparison UI should work for:
 Player vs Player
 Team vs Team
11. Design Patterns
Cards
Rounded, minimal, white background.
Stats Display
Use:
 Horizontal bar charts
 Circular progress
 Clean tables
Avoid cluttered graphs.
12. Accessibility for Indian Market
 Large tap areas
 Clear typography
 Minimal English jargon
 Support Hindi + regional languages later
 Low bandwidth optimization
13. Dark Mode
Very important for sports app.
Must design:
 Light theme
 Dark theme
Accent colors remain consistent.
14. UX Flow (India Context)
Example flow:
Player →
Register →
Join Team →
Pay Fee →
Play Match →
View Stats →
Download Certificate
Organizer →
Create Tournament →
Approve Teams →
Generate Fixtures →
Start Matches →
Monitor Revenue
15. Performance Requirements
Since India includes rural users:
 Low-data mode
 Offline scoring (important)
 Background sync
 Image compression
16. Visual Identity for Game Sphere
Brand personality:
 Bold
 Competitive
 Trustworthy
 Modern
 Pan-India inclusive
Tagline example:
“Powering Every Game. Everywhere.”
17. What Makes This Truly Multi-Sport
Instead of building:
Separate UI per sport ❌
Build:
Universal Match Framework ✅
Dynamic Stat Components ✅
Configurable Score Engine ✅
Modular UI Cards ✅
18. Phase 2 UI Expansion
 AI match summary card
 Highlight reels
 Social share cards
 Fan interaction section
 Sponsorship banners
19. Final Design Strategy Summary
Game Sphere UI must be:
 Sport-agnostic
 Modular
 Data-driven
 Mobile-first
 Scalable across India
 Lightweight for low bandwidth