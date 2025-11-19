# TRYBE Codebase Overview

## Project Description
TRYBE is an accountability club application designed to help users achieve their goals through structured challenges, regular check-ins, and community engagement.

## Tech Stack
- **Framework**: [Remix](https://remix.run/) (React Router v7)
- **Language**: TypeScript
- **Database**: PostgreSQL (managed via [Prisma ORM](https://www.prisma.io/))
- **Styling**: [Tailwind CSS](https://tailwindcss.com/)
- **Authentication**: Clerk (primary), Supabase (secondary/legacy)
- **Deployment**: [Fly.io](https://fly.io/)
- **Testing**: [Vitest](https://vitest.dev/)
- **Error Tracking**: Sentry

## Key Directories
- **`app/`**: Contains the core application logic.
    - **`routes/`**: Application routes (Remix file-based routing).
    - **`components/`**: Reusable UI components.
    - **`models/`**: Domain models and business logic.
    - **`ui/`**: Likely a design system or base UI components.
- **`prisma/`**: Database schema (`schema.prisma`) and migration history.
- **`public/`**: Static assets served directly.
- **`scripts/`**: Utility scripts for database setup and maintenance.
- **`integration/`**: Integration tests.

## Key Commands

### Development
- `npm run dev`: Starts the development server.
- `npm run db:up`: Starts the PostgreSQL database using Docker.
- `npm run db:down`: Stops the database container.
- `npm run setup`: Generates Prisma client and deploys migrations.

### Testing
- `npm run test`: Runs unit tests.
- `npm run test:i`: Runs integration tests.
- `npm run coverage`: Runs tests with code coverage.

### Deployment
- `npm run build`: Builds the application for production.
- `npm run deploy`: Deploys the application to Fly.io (production).
- `npm run staging`: Deploys to the staging environment.

## Data Model Highlights
The database schema focuses on user engagement and accountability:
- **User**: The core entity, linked to Clerk for auth.
- **Challenge**: The main activity unit (e.g., "30 Days of Yoga").
- **CheckIn**: Daily or regular user submissions for a challenge.
- **Post/Note/Thread**: Community interaction primitives.
- **Cohort**: Groups of users participating in a challenge together.

## Architecture & Patterns
- **Server-Side Rendering (SSR)**: Leverages Remix for efficient data loading and rendering.
- **Type Safety**: extensive use of TypeScript and Prisma-generated types.
- **Containerization**: Docker is used for local database orchestration and likely for production deployment via Fly.io.
