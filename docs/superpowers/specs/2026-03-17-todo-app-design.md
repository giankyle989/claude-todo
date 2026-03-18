# Todo App — Design Spec

## Overview

A fullstack todo application built as a learning project for vibe coding with an agentic AI assistant. The app provides basic CRUD todo management with user authentication. The focus is on a clean, responsive, minimal implementation.

## Tech Stack

- **Framework:** Next.js 15 (App Router)
- **Language:** TypeScript
- **Database:** PostgreSQL (local Docker container)
- **ORM:** Prisma
- **Styling:** Tailwind CSS
- **Auth:** NextAuth.js v5 (Auth.js) with credentials provider
- **Testing:** Vitest (unit tests for server actions), Playwright (e2e tests for critical flows)

## Data Model

### User

| Field     | Type     | Notes              |
|-----------|----------|--------------------|
| id        | String   | Primary key (cuid) |
| email     | String   | Unique             |
| name      | String?  | Optional           |
| password  | String   | Hashed (bcrypt)    |
| createdAt | DateTime | Default: now()     |
| updatedAt | DateTime | Auto-updated       |
| todos     | Todo[]   | One-to-many        |

### Todo

| Field     | Type     | Notes              |
|-----------|----------|--------------------|
| id        | String   | Primary key (cuid) |
| title     | String   |                    |
| completed | Boolean  | Default: false     |
| createdAt | DateTime | Default: now()     |
| updatedAt | DateTime | Auto-updated       |
| userId    | String   | Foreign key → User |

## Authentication

- **Provider:** Credentials (email + password)
- **Password hashing:** bcrypt (minimum 8 characters)
- **Session strategy:** JWT stored in a cookie
- **Route protection:** Next.js middleware redirects unauthenticated users to `/login`
- **Scope:** Register, login, logout. No forgot-password flow.

## Pages

### `/login`

- Centered card with email and password fields
- Submit button to sign in
- Link to `/register`
- Displays error messages on invalid credentials

### `/register`

- Centered card with name (optional), email, and password fields
- Submit button to create account
- Link to `/login`
- Password must be at least 8 characters; show inline validation error if too short
- Displays error messages on validation failure (e.g., email already taken)
- On success: auto-login and redirect to `/`

### `/` (protected)

- **Header bar:** App name on the left, user name + logout button on the right
- **Add todo:** Input field with "Add" button at the top
- **Todo list:** Each item shows:
  - Checkbox to toggle completed state
  - Title text (strikethrough when completed)
  - Delete button (trash icon)
- **Empty state:** Friendly message when no todos exist
- **Sort order:** Newest first (createdAt descending)

## Backend

- **Data fetching:** Server Components query Prisma directly
- **Mutations:** Server Actions for create todo, toggle complete, delete todo, register, login, logout
- **Validation:** Server-side input validation on all actions
- **Authorization:** Each todo action verifies the todo belongs to the authenticated user
- **Error handling:** Server Actions return error messages on failure; the UI displays a brief inline error (e.g., "Failed to add todo") that auto-dismisses after a few seconds

## UI / Responsive Design

- **Tailwind CSS** for all styling
- **Desktop:** Centered container with a comfortable max-width (~640px)
- **Mobile:** Full-width layout with appropriate padding, touch-friendly tap targets for buttons and checkboxes
- **Auth pages:** Centered card layout, stacked form fields on all screen sizes
- **No component library** — plain Tailwind utility classes

## Version Control

- **Git + GitHub**
- **Branches:**
  - `develop` — default working branch, used for local development and testing
  - `prod` — production branch, deployed to AWS

## CI/CD

> **Superseded by:** `docs/superpowers/specs/2026-03-18-deployment-cicd-design.md`

- **GitHub Actions** with two workflows:
  - **CI (on push to `develop` and PRs to `prod`):** Install dependencies, lint, type-check, run tests
  - **Deploy (`workflow_dispatch` on `prod`, manual trigger):** SSH into EC2, run blue-green deploy script
- **Branch flow:** Work on `develop` → merge to `prod` → manually trigger GitHub Action → blue-green deploy to EC2

## Deployment

> **Superseded by:** `docs/superpowers/specs/2026-03-18-deployment-cicd-design.md`

- **Hosting:** EC2 t2.micro (Amazon Linux 2023) with PM2 + Nginx
- **Database:** PostgreSQL installed on the same EC2 instance
- **Deploy strategy:** Blue-green (two app slots on ports 3000/3001, Nginx switches traffic)
- **Environments:**
  - **Develop (local):** `npm run dev` + local Docker PostgreSQL
  - **Production (EC2):** Blue-green deploy via GitHub Actions + deploy.sh on EC2
- **Environment variables:** Managed via shared `.env` on EC2 (`DATABASE_URL`, `NEXTAUTH_SECRET`, `NEXTAUTH_URL`)

## Out of Scope

- Editing todo title after creation
- Forgot password / email verification
- Categories, tags, priorities, due dates
- Drag-and-drop reordering
- Search or filtering
- Dark mode
- Multi-user collaboration / shared lists
