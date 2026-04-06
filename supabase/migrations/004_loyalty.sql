-- ============================================================
-- LOYALTY PROGRAM: Points for purchases, redeemable for discounts
-- ============================================================

-- Points balance lives on the member (fast reads for POS)
ALTER TABLE members ADD COLUMN loyalty_points INTEGER NOT NULL DEFAULT 0;

-- Points rate on the shop (configurable)
ALTER TABLE shops ADD COLUMN loyalty_points_per_euro DECIMAL(4,2) NOT NULL DEFAULT 1.00;
ALTER TABLE shops ADD COLUMN loyalty_euro_per_point DECIMAL(6,4) NOT NULL DEFAULT 0.10;
-- Default: 1 point per €1 spent, each point worth €0.10
-- So €10 spent = 10 points = €1.00 discount

-- Ledger: every point movement is recorded
CREATE TABLE loyalty_ledger (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    shop_id         UUID         NOT NULL REFERENCES shops(id),
    member_id       UUID         NOT NULL REFERENCES members(id),
    transaction_id  UUID         REFERENCES transactions(id), -- NULL for manual adjustments
    type            VARCHAR(20)  NOT NULL CHECK (type IN ('earn', 'redeem', 'adjust')),
    points          INTEGER      NOT NULL, -- positive for earn/adjust-up, negative for redeem/adjust-down
    balance_after   INTEGER      NOT NULL, -- snapshot of balance after this entry
    description     TEXT,
    created_by      UUID         NOT NULL REFERENCES staff_users(id),
    created_at      TIMESTAMPTZ  NOT NULL DEFAULT now()
);

CREATE INDEX idx_loyalty_ledger_member ON loyalty_ledger (member_id, created_at DESC);
CREATE INDEX idx_loyalty_ledger_txn ON loyalty_ledger (transaction_id) WHERE transaction_id IS NOT NULL;
