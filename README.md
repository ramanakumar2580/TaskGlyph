This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

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

    git clone https://github.com/ramanakumar2580/TaskGlyph
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
