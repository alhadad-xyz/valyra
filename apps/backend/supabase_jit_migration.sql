-- Migration: Create Ledger Tables (Balances, Holds, PendingDeposits)

-- 1. Create Enums
BEGIN;

DO $$ BEGIN
    CREATE TYPE hold_status AS ENUM ('PENDING', 'RELEASED', 'REJECTED');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE deposit_status AS ENUM ('PENDING', 'COMPLETED', 'HELD', 'FAILED');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- 2. Create Balances Table
CREATE TABLE IF NOT EXISTS balances (
    id SERIAL PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    amount NUMERIC(20, 2) NOT NULL DEFAULT 0,
    currency VARCHAR(10) NOT NULL DEFAULT 'IDRX',
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

-- 3. Create Holds Table
CREATE TABLE IF NOT EXISTS holds (
    id SERIAL PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    amount NUMERIC(20, 2) NOT NULL,
    reason TEXT NOT NULL,
    status hold_status NOT NULL DEFAULT 'PENDING',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()),
    resolved_at TIMESTAMP WITH TIME ZONE
);

-- 4. Create Pending Deposits Table
CREATE TABLE IF NOT EXISTS pending_deposits (
    id SERIAL PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    amount NUMERIC(20, 2) NOT NULL,
    tx_hash VARCHAR(255) NOT NULL UNIQUE,
    status deposit_status NOT NULL DEFAULT 'PENDING',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

-- 5. Create Indexes for Performance
CREATE INDEX IF NOT EXISTS idx_balances_user_id ON balances(user_id);
CREATE INDEX IF NOT EXISTS idx_holds_user_id ON holds(user_id);
CREATE INDEX IF NOT EXISTS idx_pending_deposits_user_id ON pending_deposits(user_id);
CREATE INDEX IF NOT EXISTS idx_pending_deposits_tx_hash ON pending_deposits(tx_hash);

COMMIT;
