# Rent Room

## Technology stack

| Technology | Purpose |
| --- | --- |
| Next.js 16 | App Router, SSR / SSG, and client-side UI |
| React 19 | UI components |
| TypeScript | Type safety |
| Tailwind CSS 4 | Styling and responsive layouts |
| NextAuth.js | Authentication and authorization |
| MongoDB | Stores users, rooms, and bookings |
| UploadThing | Room photo uploads |
| Zustand | Client-side filter and settings state |
| Jest + Testing Library | Unit and integration tests |

## Quick start

1. Install dependencies:

```bash
pnpm install
```

2. Copy the environment file:

```bash
cp .env.example .env
```

3. Set the environment variable values in `.env`.

4. Start the development server:

```bash
pnpm dev
```

5. Open `http://localhost:3000` in your browser.

## Configuration

| Variable | Description |
| --- | --- |
| `MONGODB_URI` | MongoDB connection URI |
| `DB_NAME` | Database name |
| `AUTH_GOOGLE_ID` | Google OAuth client ID |
| `AUTH_GOOGLE_SECRET` | Google OAuth client secret |
| `ADMIN_EMAIL` | Administrator email address |
| `ORGANIZATION_EMAIL` | Email address used to send messages |
| `ORGANIZATION_EMAIL_PASS` | Email account password or token |
| `NEXT_PUBLIC_APP_URL` | Public application URL |

> The `ADMIN` role is assigned based on the email in `ADMIN_EMAIL`.

## Project structure

| Directory | Description |
| --- | --- |
| `app/` | Pages, layouts, and UI components |
| `app/api/` | API routes, including UploadThing and NextAuth |
| `src/auth/` | NextAuth configuration and authentication |
| `src/lib/` | MongoDB connection and server actions |
| `src/lib/actions/` | Business logic for users, rooms, and bookings |
| `src/types/` | Data interfaces and types |
| `src/store/` | Zustand state |
| `public/` | Static assets |

## Features

- Email and password login, with automatic registration through credentials
- Google OAuth login
- `ADMIN` and `GUEST` roles with protected admin routes
- Room creation, editing, and browsing
- Room photo uploads through UploadThing
- Room search, filtering, and sorting
- Booking creation and booking history
- Room analytics with monthly confirmed booking values and a forecast
- Password reset by email
- Server-side tests for MongoDB business logic

> The admin forecast allocates confirmed booking values across months by occupied nights and uses the average of the previous six complete months. A forecast is available when bookings occurred in at least three of those months. Since the system does not track actual payments or expenses, analytics show an estimate of booking value, not profit.

## Requirements

See the [software requirements](requirements/software-requirements.md) for documented functional and non-functional requirements, user scenarios, and known limitations based on the current implementation.

## Architecture

| Component | Purpose |
| --- | --- |
| NextAuth | Sign-in, sign-out, JWT sessions, and user roles |
| MongoDB Adapter | Stores users and accounts |
| JWT session | Stores `id` and `role` in a cookie |
| UploadThing | Secure photo uploads for administrators |
| Server Actions | Server-side business logic |
| `proxy.ts` | Redirects to the sign-in page and protects routes |

## Routes

### Pages

| Path | Description |
| --- | --- |
| `/` | Home page with the room listing |
| `/auth/login` | Sign-in and registration |
| `/auth/forgot-password` | Request a password reset |
| `/auth/forgot-password/reset-password` | Set a new password |
| `/guest/guestProfile` | Guest profile |
| `/guest/room/[id]` | Room details |
| `/admin` | Admin dashboard |
| `/admin/create-room` | Create a room |
| `/admin/edit-room/[id]` | Edit a room |
| `/admin/forecast` | Room booking value analytics and forecast |

### API

| Method | Path | Description |
| --- | --- | --- |
| `POST` | `/api/auth/*` | NextAuth sign-in and session endpoints |
| `GET` | `/api/uploadthing` | UploadThing file uploads |
| `POST` | `/api/uploadthing` | Room photo uploads |

### Server actions

| File | Description |
| --- | --- |
| `src/lib/actions/room.actions.ts` | Room operations |
| `src/lib/actions/order.actions.ts` | Booking and order operations |
| `src/lib/actions/forecast.actions.ts` | Room booking analytics |
| `src/auth/actions/auth.actions.ts` | Password reset and updates |
| `src/lib/actions/user.actions.ts` | User creation, lookup, and sign-out |

## Commands

| Command | Purpose |
| --- | --- |
| `pnpm dev` | Start the development server |
| `pnpm build` | Build the project |
| `pnpm start` | Start the production build |
| `pnpm lint` | Run ESLint |
| `pnpm format` | Run Prettier |
| `pnpm test` | Run Jest tests |
