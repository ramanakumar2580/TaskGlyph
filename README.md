# TaskGlyph

[![Vercel App](https://img.shields.io/badge/Vercel-Live_App-black?style=for-the-badge&logo=vercel)](https://taskglyph.vercel.app/)

**Live Demo:** [https://taskglyph.vercel.app/](https://taskglyph.vercel.app/)

**TaskGlyph** is a full-stack, offline-first productivity platform designed for knowledge workers who need resilience, focus, and ownership.

Unlike Notion, Trello, or Todoist—which fail without internet—TaskGlyph thrives offline, working seamlessly on planes, subways, or during internet outages, then syncing effortlessly when back online. It acts as a personal operating system for your work life, combining task management, markdown-based notes, a personal diary, a Pomodoro timer, and analytics into a single unified dashboard.

---

## Key Features

- **Offline-First Architecture:** 100% functionality without internet. Data is saved locally via **IndexedDB** and synced when online.
- **Robust Sync Engine:** Automatic background synchronization with **PostgreSQL** using a "last-write-wins" conflict resolution strategy.
- **Unified Dashboard:** Manage tasks, notes, and diary entries in one view.
- **Pomodoro Timer:** Built-in focus timer integrated with your task workflow.
- **Media Support:** Image attachments supported via **AWS S3** (uploads sync when online).
- **AI Insights:** Weekly AI-powered summaries of your productivity (e.g., "You completed 18 tasks this week").
- **Freemium Model:** \* **Free:** 21 tasks, 14 notes, unlimited diary.
  - **Pro:** Unlimited access, multi-device sync, and advanced analytics.

---

## Technical Architecture

TaskGlyph is built as a **Full-Stack Monolith** using **Next.js 15 (App Router)**.

- **Frontend & Local Storage:** React with **Dexie.js** wrapper for IndexedDB management.
- **Backend:** Next.js API Routes (Serverless functions).
- **Database:** **PostgreSQL** (hosted on Neon.tech) via Prisma/Drizzle (assumed ORM).
- **Authentication:** **NextAuth.js** with Google OAuth.
- **Storage:** **AWS S3** for user uploads.
- **Payments:** **Razorpay** integration for Pro tier upgrades.
- **Styling:** **Tailwind CSS** for a clean, responsive, performance-first UI.

---

## Environment Variables

To run this project locally, you must create a `.env.local` file in the root directory.

**Note:** Ensure you have accounts set up for NeonDB, Google Cloud Console, AWS S3, and Razorpay.

```bash
# ------------------------------
# AUTHENTICATION (NextAuth & Google)
# ------------------------------
GOOGLE_CLIENT_ID=your_google_client_id_here
GOOGLE_CLIENT_SECRET=your_google_client_secret_here
NEXTAUTH_URL="http://localhost:3000"
# Generate a secret using `openssl rand -base64 32`
NEXTAUTH_SECRET=your_nextauth_secret_here

# ------------------------------
# DATABASE (Neon.tech PostgreSQL)
# ------------------------------
DATABASE_URL="postgresql://user:password@ep-rapid-scene.region.aws.neon.tech/neondb?sslmode=require"

# ------------------------------
# EMAIL SERVICES
# ------------------------------
RESEND_API_KEY=re_your_resend_api_key_here

# ------------------------------
# FILE STORAGE (AWS S3)
# ------------------------------
# Private server-side keys
AWS_S3_BUCKET_NAME=taskglyph-uploads-yourname
AWS_S3_REGION=ap-south-1
AWS_ACCESS_KEY_ID=your_aws_access_key_id
AWS_SECRET_ACCESS_KEY=your_aws_secret_access_key

# Public keys (safe for browser)
NEXT_PUBLIC_AWS_S3_BUCKET_NAME=taskglyph-uploads-yourname
NEXT_PUBLIC_AWS_S3_REGION=ap-south-1

# ------------------------------
# APP CONFIG
# ------------------------------
NODE_ENV=development

# ------------------------------
# PAYMENTS (Razorpay)
# ------------------------------
NEXT_PUBLIC_RAZORPAY_KEY_ID=rzp_test_your_id_here
RAZORPAY_KEY_SECRET=your_razorpay_secret_here

# ------------------------------
# AI INTEGRATION
# ------------------------------
# API Key for AI Insights Service
GOOGLE_API_KEY=your_google_ai_api_key_here
```

## Getting Started

Follow these steps to get the project up and running on your local machine.

### 1. Clone the repository

    git clone https://github.com/ramanakumar2580/TaskGlyph.git
    cd taskglyph

### 2. Install dependencies

This project requires `ts-node` to run database scripts. Install the core dependencies and the TypeScript execution tools:

    npm install
    npm install -D ts-node typescript @types/node

### 3. Set up the Database (NeonDB)

Ensure your `DATABASE_URL` is correct in `.env.local`.

To create or update your tables in NeonDB, run the initialization script:

    npx ts-node src/scripts/initDb.ts

### 4. Run the development server

    npm run dev

### 5. Open the app

Navigate to http://localhost:3000 to see the application.
