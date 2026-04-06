-- ============================================================
-- CHECK-INS: Track member entry/exit at the club
-- ============================================================

CREATE TABLE check_ins (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    shop_id         UUID         NOT NULL REFERENCES shops(id),
    member_id       UUID         NOT NULL REFERENCES members(id),
    checked_in_by   UUID         NOT NULL REFERENCES staff_users(id),
    checked_in_at   TIMESTAMPTZ  NOT NULL DEFAULT now(),
    checked_out_at  TIMESTAMPTZ,       -- NULL = still in the club
    created_at      TIMESTAMPTZ  NOT NULL DEFAULT now()
);

-- Index for fast "who is currently in the club" queries
CREATE INDEX idx_check_ins_active ON check_ins (shop_id, checked_out_at)
    WHERE checked_out_at IS NULL;

-- Index for member visit history
CREATE INDEX idx_check_ins_member ON check_ins (member_id, checked_in_at DESC);

-- Index for daily check-in lookups
CREATE INDEX idx_check_ins_shop_date ON check_ins (shop_id, checked_in_at DESC);

-- Add max_capacity to shops table
ALTER TABLE shops ADD COLUMN max_capacity INTEGER NOT NULL DEFAULT 50;
