# Todo App — Design Spec

## Overview

A fullstack todo application built as a learning project for vibe coding with an agentic AI assistant. The app provides basic CRUD todo management with user authentication. The focus is on a clean, responsive, minimal implementation.

## Tech Stack

- **Framework:** Next.js 15 (App Router)
- **Language:** TypeScript
- **Database:** PostgreSQL
- **ORM:** Prisma
- **Styling:** Tailwind CSS
- **Auth:** NextAuth.js v5 (Auth.js) with credentials provider

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
- **Password hashing:** bcrypt
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
- Displays error messages on validation failure (e.g., email already taken)

### `/` (protected)

- **Header bar:** App name on the left, user name + logout button on the right
- **Add todo:** Input field with "Add" button at the top
- **Todo list:** Each item shows:
  - Checkbox to toggle completed state
  - Title text (strikethrough when completed)
  - Delete button (trash icon)
- **Empty state:** Friendly message when no todos exist

## Backend

- **Data fetching:** Server Components query Prisma directly
- **Mutations:** Server Actions for create todo, toggle complete, delete todo, register, login, logout
- **Validation:** Server-side input validation on all actions
- **Authorization:** Each todo action verifies the todo belongs to the authenticated user

## UI / Responsive Design

- **Tailwind CSS** for all styling
- **Desktop:** Centered container with a comfortable max-width (~640px)
- **Mobile:** Full-width layout with appropriate padding, touch-friendly tap targets for buttons and checkboxes
- **Auth pages:** Centered card layout, stacked form fields on all screen sizes
- **No component library** — plain Tailwind utility classes

## Out of Scope

- Forgot password / email verification
- Categories, tags, priorities, due dates
- Drag-and-drop reordering
- Search or filtering
- Dark mode
- Multi-user collaboration / shared lists
