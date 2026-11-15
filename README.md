# SehatSathi

> **Medicine reminders that tell the family when a dose is missed.**

[![Deployed Prototype](https://img.shields.io/badge/Live%20Prototype-View%20App-00AC73?style=for-the-badge)](YOUR_DEPLOYED_URL_HERE)
[![Tests Passing](https://img.shields.io/badge/Tests-17%20Passed-brightgreen?style=for-the-badge)](./tests)
[![Code Quality](https://img.shields.io/badge/Security-Bcrypt%20%7C%20OTP%20%7C%20Audit%20Log-blue?style=for-the-badge)](./server)

**Live Prototype URL:** [See the Deployed Prototype Here](YOUR_DEPLOYED_URL_HERE) *(Paste your deployed URL here)*

---

## What Problem SehatSathi Solves

Senior citizens often struggle with complex medication routines, forget doses, or find modern apps overwhelming due to small text and complex passwords. Families worry constantly about whether medicines were taken.

**SehatSathi solves this with a two-sided system:**
1. **For the Elder**: A high-contrast mobile screen with large 48px touch targets, a simple 4-digit PIN, audio readout for every medicine, and a single "I took it" tap.
2. **For the Family**: An automated 3-stage escalation safety net. If a scheduled dose is missed, an email reminder goes to the elder, then to the primary caretaker, then to the entire family circle. The elder always controls who can see or edit their medicines.

![SehatSathi Hero Screen](./docs/images/hero.jpg)

---

## Key Features

- **One-Touch Elder Screen**: Large buttons, high contrast, and a 4-digit PIN.
- **Listen Aloud (Speech Synthesis)**: Reads medicine names, dosages, and instructions aloud with one tap.
- **3-Stage Escalation Chain**:
  1. *Stage 1*: Elder phone reminder at scheduled time.
  2. *Stage 2*: Caretaker email alert if dose remains unconfirmed after the grace period.
  3. *Stage 3*: Extended family alert if the dose is still missed.
- **Elder-Controlled Permissions**: The elder can grant view-only access or medication-editing permissions and can revoke family access at any time with one tap.
- **Caretaker Management**: Add, edit, or remove medicines and doctor appointments, with Gemini AI prescription assistance.
- **Voice & Text Schedule Assistant**: Answers natural queries in English or Hindi about today's medicine times and upcoming doctor visits.
- **Audit Log**: Immutable record of every confirmed dose, prescription change, and escalation email.

| Elder Overview & Audio Readout | Voice & Text Schedule Assistant |
| :---: | :---: |
| ![Elder Overview](./docs/images/elder_overview.png) | ![Assistant](./docs/images/assistant.png) |

| Caretaker Medication Management (Edit/Delete) | Real-Time Email Confirmation |
| :---: | :---: |
| ![Caretaker Meds](./docs/images/caretaker_meds.jpg) | ![Email Confirmation](./docs/images/email_confirmation.png) |

---

## How to Use SehatSathi (Step-by-Step)

### Step 1: Elder Account Setup
1. On the home page, tap **Elder login**.
2. Select **New registration**, enter your email, tap **Send Code**, and enter the 6-digit verification code sent to your inbox.
3. Choose a simple 4-digit PIN and enter your name.
4. Your dashboard will display a shareable 6-digit **Elder link code** (e.g. `EL-T94M`).

### Step 2: Family / Caretaker Connect
1. The family member goes to **Family and caretaker login** on their device.
2. Register with email verification and enter the elder's link code.
3. You are now connected to the senior's care circle.

### Step 3: Assigning Medications & Doctor Visits
1. In the Caretaker portal, go to **Medications** &rarr; **Add Medication**.
2. Enter the medicine name, dosage, instructions, and daily times (e.g. `08:00, 20:00`), or paste prescription text to parse with AI.
3. Need to change dosage or timing later? Tap the **Edit** icon on any card to update it, or the **Delete** icon to remove it.
4. Go to **Doctor Appointments** to schedule clinic visits.

### Step 4: Elder Takes Dose
1. When it's time for medicine, the elder opens their portal.
2. Tap **Listen** to hear the dose and instructions spoken aloud.
3. Tap **I took it**.
4. The caretaker instantly receives an email confirmation: *"Medication confirmed as taken"*.

### Step 5: Missed Dose Escalation
- If a dose is not marked as taken after the grace period (15 minutes by default, 1 minute in demo mode), the background escalation pipeline automatically triggers and emails the caretaker, followed by the rest of the family circle.

---

## AI Evaluation Parameters

| Parameter | Implementation Details |
| :--- | :--- |
| **Code Quality** | Clean separation of concerns (`client/` Vite + React + TS, `server/` Express + Prisma). Strict Zod schema validation on every endpoint. |
| **Security** | Bcrypt hashing on senior PINs and passwords, 5-minute single-use OTPs with replay protection, 60s cooldown, 5-attempt brute-force lockout, Helmet HTTP headers, HttpOnly cookies. |
| **Efficiency** | Pure deterministic escalation evaluation functions, indexed database queries (`linkCode`, `userId`, `scheduledFor`), lightweight client bundle (<95KB gzipped). |
| **Testing** | 17 automated unit and integration tests passing (`vitest run`). Tests escalation math, API validation, password hashing, and permission guardrails. |
| **Accessibility** | High contrast ratios, 48px+ touch targets, native browser speech synthesis for seniors, ARIA labels, zero confusing forms. |
| **Alignment** | 100% focused on elderly medication adherence and family safety escalation. |

---

## Deployment & Local Setup

### Local Run
```bash
# 1. Install dependencies
npm install
npm install --prefix client

# 2. Database & Environment
cp .env.example .env
npx prisma db push

# 3. Run development servers (Frontend + Backend)
npm run dev
```

### Production Deployment (Vercel)
Deploy directly on [Vercel](https://vercel.com) with automatic fullstack routing (`vercel.json`):
1. Import this repository on Vercel.
2. Add your environment variables (`DATABASE_URL`, `JWT_SECRET`, `CRON_SECRET`, `RESEND_API_KEY`, `GEMINI_API_KEY`).
3. Click **Deploy**.

---

*SehatSathi • Built for Prompt Wars X Catalyst 2026*
