# Supabase Setup Guide for Valyra

This guide walks you through setting up a Supabase project for the Valyra backend, which provides our managed PostgreSQL database and vector search capabilities.

## 📋 Prerequisites

- **Supabase Account**: Sign up at [supabase.com](https://supabase.com)
- **GitHub Account**: For authenticating with Supabase

## 🚀 Step-by-Step Setup

### 1. Create a New Project

1.  Go to the [Supabase Dashboard](https://supabase.com/dashboard/projects).
2.  Click **"New project"**.
3.  Select your organization (e.g., `Valyra`).
4.  **Name**: `valyra-prod` (or `valyra-dev` for testing).
5.  **Database Password**: Generate a strong password and **save it securely**. You will need this for the `DATABASE_URL`.
6.  **Region**: Choose a region close to your users (e.g., `Singapore` or `US West`).
7.  Click **"Create new project"**.
8.  Wait for the project to finish provisioning (usually takes ~2 minutes).

### 2. Get API Keys

1.  In your project dashboard, go to **Settings** (gear icon) -> **API**.
2.  Find the **Project URL** and **Project API keys**.
3.  Copy the following values to your local `.env` file (or deployment environment variables):

    ```bash
    # Update these in apps/backend/.env
    SUPABASE_URL=type_your_project_url_here
    SUPABASE_KEY=type_your_anon_public_key_here
    SUPABASE_SERVICE_KEY=type_your_service_role_key_here
    ```

### 3. Get Database Connection String

1.  Go to **Settings** -> **Database**.
2.  Under **Connection string**, make sure **URI** mode is selected.
3.  Copy the connection string. It will look like this:
    `postgresql://postgres.projectref:[YOUR-PASSWORD]@aws-0-region.pooler.supabase.com:6543/postgres`
4.  Replace `[YOUR-PASSWORD]` with the password you created in Step 1.
5.  Update your `.env` file:

    ```bash
    DATABASE_URL=postgresql://postgres.projectref:password@aws-0-region.pooler.supabase.com:6543/postgres
    ```

    > **Note:** For Transaction mode (recommended for serverless/Lambda), use port `6543`. For Session mode (direct connection), use port `5432`. Our backend works with both, but Transaction mode is better for scaling.

### 4. Enable Vector Extension (Automated)

The project includes an Alembic migration that will automatically enable the `vector` extension when you run migrations.

However, if you wish to verify or enable it manually:
1.  Go to **SQL Editor** in the side menu.
2.  Run this query:
    ```sql
    CREATE EXTENSION IF NOT EXISTS vector;
    ```
3.  Check connection success.

### 5. Disable Data API (Security Best Practice)

Since we are using a dedicated Python backend and not accessing the database directly from the client, it is recommended to disable the client-side Data API to prevent unauthorized access.

1.  Go to **Settings** -> **API**.
2.  Under **Data API Settings**, uncheck **"Enable Data API"**.
3.  Click **Save**.

## ✅ Verification

To verify your setup is working with the backend:

1.  Ensure your `.env` file is updated with the new `DATABASE_URL`, `SUPABASE_URL`, and keys.
2.  Run database migrations:
    ```bash
    # Locally
    cd apps/backend
    docker-compose up --build
    # Then in another terminal
    docker-compose exec backend alembic upgrade head
    ```
3.  If the migration succeeds, the `vector` extension is enabled and the database is ready!
