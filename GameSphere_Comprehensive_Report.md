# Game Sphere — Comprehensive Project Report

## 1. Executive Summary
Game Sphere is a modern, comprehensive sports management platform designed to connect players, team managers, officials, and tournament organizers. The platform is designed with a sleek, user-friendly interface offering real-time dashboards, sports profile management, interactive tournament tracking, and robust authentication mechanisms.

## 2. System Architecture
The application features a decoupled architecture ensuring scalable, high-performance delivery across the stack.

### Frontend
- **Framework:** Next.js (App Router paradigm) with React.
- **Styling:** Vanilla CSS with strategic inline styling and custom utility classes.
- **State Management:** Zustand, providing lightweight and fast global state.
- **Key UI Patterns:** Responsive design, glassmorphism aesthetics, dynamic custom components (e.g., RunningAthleteLoader), responsive hamburger navigation (`lucide-react`).

### Backend
- **Framework:** NestJS, providing a modular and robust REST API architecture.
- **Database:** PostgreSQL hosted on Supabase.
- **ORM:** Prisma Client used for deterministic type-safe database migrations and queries.
- **Authentication:** Hybrid authentication utilizing Supabase Auth (for identity, OTPs, and sessions) integrated seamlessly with NestJS custom JWT wrappers for deep RBAC (Role-Based Access Control).

## 3. Core Features & Capabilities

### Identity & Authentication
- **Multi-Role Support:** Users can register as `PLAYER`, `TEAM_MANAGER`, `ORGANIZER`, or `OFFICIAL`—with routing dynamically adjusting based on their role upon login.
- **Phone OTP Gateway:** Secure phone login mechanism serving as the primary fast-access gateway before entering the application. 
- **Email Verification:** Mandated email confirmation steps integrated into the registration wizard.

### User Profiles & Centralized Settings
- **Profile Dashboard:** A stunning, read-only analytics dashboard for viewing historical match data, tournament participation, and achieved certificates.
- **Unified Settings Hub:** All account mutations have been centralized into a singular Configuration Hub:
  - **Personal Details:** Edit District, State, Country, Height, Weight, and Contact info.
  - **Sports & Teams Manager:** Automatically fetches registered sports (allowing users to Delete Sports profiles) and Teams (allowing seamless "Exit Team" functionality).
  - **Granular Preferences:** Dark Mode toggle, Email/Push notification toggles, and advanced options like "Pause Notifications (1 Hour)" and "Sleep Mode."

### Tournament & Match Management
- **Role-Specific Dashboards:** Organizers can spin up new Tournaments, manage brackets, and execute live scoring. Players can browse available fixtures.
- **Leaderboards:** Dynamic tournament-scoped leaderboards tracking player statistics (e.g., total runs, wickets) globally.
- **Team Management:** Invite codes, roster limitations, and position assignments. 

## 4. Security & Compliance
- **Data Protection:** Leveraging Supabase RLS (Row Level Security) and strict backend endpoints protected by `@UseGuards(JwtAuthGuard)`.
- **Social Mission Integration:** Prominently promoting a "Drug-Free Society" throughout the platform design inline with client directives.

## 5. Recent Enhancements
- Global replacement of generic waiting spinners with the custom CSS-animated **Running Athlete Loading Overlay**.
- Transformation of desktop-only linear navigation into an Instagram-inspired sliding **Hamburger Navigation Drawer** for universally responsive UI.
- Complete overhaul of the Auth Flow for faster OTP verification mapping directly to dashboard redirection.

## 6. Future Roadmap
- Implementation of deep-link push notifications using device tokens.
- Live WebSockets for real-time score updates to viewing spectators without manual refreshing.
- Advanced export functionalities for Organizers (CSV match reports, PDF bracket generation).
