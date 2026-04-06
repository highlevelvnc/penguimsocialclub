-- ============================================================
-- AUDIT LOG: Track all staff actions for compliance
-- ============================================================

CREATE TABLE audit_log (
    id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    shop_id     UUID         NOT NULL REFERENCES shops(id),
    staff_id    UUID         NOT NULL REFERENCES staff_users(id),
    action      VARCHAR(50)  NOT NULL, -- e.g. 'member.create', 'checkout', 'stock.adjust'
    entity_type VARCHAR(30),           -- 'member', 'product', 'transaction', etc.
    entity_id   UUID,                  -- ID of the affected entity
    details     TEXT,                  -- Human-readable description
    created_at  TIMESTAMPTZ  NOT NULL DEFAULT now()
);

CREATE INDEX idx_audit_log_shop ON audit_log (shop_id, created_at DESC);
CREATE INDEX idx_audit_log_staff ON audit_log (staff_id, created_at DESC);
CREATE INDEX idx_audit_log_entity ON audit_log (entity_type, entity_id) WHERE entity_id IS NOT NULL;
