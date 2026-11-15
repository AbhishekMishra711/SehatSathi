# SehatSathi

SehatSathi is an elderly care and medication management platform designed to keep senior citizens at the center of their own healthcare decisions. It combines a mobile-first accessible interface for seniors with an automated multi-tier escalation chain, elder-controlled permissions, and safe prescription scheduling assisted by Gemini AI.

## Core Capabilities

1. Senior-First Mobile Interface
   - High-contrast clinical typography, touch targets exceeding 48px, single primary action per screen.
   - 4-digit PIN authentication with automatic 15-minute lockout after 5 consecutive failed attempts.
   - Browser-native speech synthesis to read dosage and instructions aloud for seniors with low vision.

2. Automated Escalation Engine
   - Step 1: Senior receives initial dose reminder.
   - Step 2: If unconfirmed after the grace window (configurable, 15 minutes default, 1 minute in demo mode), the primary caretaker is alerted via email.
   - Step 3: If still unconfirmed after a second window, extended family members are notified.
   - All time calculations are evaluated through pure functions, making escalation fully deterministic, idempotent, and testable.

3. Elder-Controlled Permissions
   - The senior decides what each linked caregiver can view or edit (medications, doctor visits, logs).
   - Seniors can revoke caregiver access instantly from their device.

4. Safe Prescription Scheduling with Gemini AI
   - Converts natural doctor instructions (e.g., "1 tablet of Metformin 500mg after breakfast and dinner for 2 weeks") into structured daily schedules.
   - AI outputs are strictly treated as suggestions and require human verification and confirmation before anything is saved to the database.

5. Tamper-Evident Audit Trail
   - Logs every medication addition, dose confirmation, permission toggle, and escalation dispatch with timestamps and actor identities.

## Demo Evaluation Credentials

Pre-seeded accounts are provided for instant evaluation:

| Role | Account Name | Email | Credential | Focus Screen |
| :--- | :--- | :--- | :--- | :--- |
| Senior | Ramesh Sharma (72) | ramesh@sehatsathi.demo | PIN: `1234` | Today Schedule, Big "I took it" button, Voice Readout, My People |
| Primary Caretaker | Aarav Sharma (Son) | aarav@sehatsathi.demo | Passcode: `Password123!` | Dashboard, Gemini Prescription Parser, Escalation Simulator |
| Family Member | Priya Sharma (Daughter) | priya@sehatsathi.demo | Passcode: `Password123!` | View-Only Meds, Appointment Scheduling, Audit Logs |

Quick 1-click login buttons are also provided directly on the landing page for evaluators.

## Tech Stack & Architecture

- Frontend: React 18, TypeScript, Vite, Lucide Icons, Web Speech API, Progressive Web App (PWA) manifest.
- Backend: Node.js, Express, Layered Architecture (Routes, Controllers, Services, Middleware).
- Database & ORM: PostgreSQL (Neon Serverless with connection pooling), Prisma ORM.
- AI Integration: Google Gemini API (`gemini-flash-lite-latest`) with Zod schema validation.
- Email Delivery: Resend API.
- Security: Argon2/Bcrypt password hashing, HttpOnly Secure SameSite cookies, JWT, Helmet security headers, Zod input validation on all endpoints, IP-based rate limiting.
- Automated Testing: Vitest, Supertest.

## Getting Started Locally

### Prerequisites
- Node.js (v18+)
- PostgreSQL connection string (Neon or local)

### Installation

1. Clone the repository and install dependencies:
   ```bash
   git clone <repo-url>
   cd SehatSathi
   npm install
   npm install --prefix client
   ```

2. Configure environment variables in `.env`:
   ```env
   DATABASE_URL="postgresql://user:password@host/neondb?sslmode=require"
   DIRECT_URL="postgresql://user:password@direct-host/neondb?sslmode=require"
   RESEND_API_KEY="re_..."
   GEMINI_API_KEY="AIza..."
   GEMINI_MODEL="gemini-flash-lite-latest"
   JWT_SECRET="your-jwt-secret"
   CRON_SECRET="your-cron-secret"
   PORT=5000
   NODE_ENV="development"
   CLIENT_URL="http://localhost:5173"
   EMAIL_FROM="onboarding@resend.dev"
   ```

3. Sync database schema and seed demo records:
   ```bash
   npm run prisma:push
   npm run seed
   ```

4. Run the development server (runs backend on port 5000 and client on 5173 concurrently):
   ```bash
   npm run dev
   ```

5. Run test suite:
   ```bash
   npm test
   ```

## Cron Trigger Endpoint

To run scheduled escalation checks in production, ping the following endpoint periodically (e.g. every 5 minutes via cron-job.org or GitHub Actions):

```
GET /api/cron/tick
Authorization: Bearer <CRON_SECRET>
```

Or pass via query parameter: `/api/cron/tick?secret=<CRON_SECRET>`

## Design Tradeoffs & Decisions

- Senior PIN vs Passcode: Seniors frequently struggle with long, complex alphanumeric passwords. SehatSathi uses a 4-digit numeric PIN for senior logins, balanced by strict server-side rate limiting and an automated 15-minute account lockout after 5 consecutive failed attempts.
- Relational Schema: Relational integrity (PostgreSQL via Prisma) was chosen because medication schedules, dose logs, and caregiver permission links are strictly relational and benefit from foreign key constraints.
- Idempotent Escalation: The cron worker checks dose status and updates escalation level in atomic database transactions, preventing duplicate email dispatches if the worker triggers multiple times.

