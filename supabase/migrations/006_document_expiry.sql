-- ============================================================
-- DOCUMENT EXPIRY: Track when member ID documents expire
-- ============================================================

ALTER TABLE members ADD COLUMN document_expiry DATE;

-- Index for finding members with expiring documents
CREATE INDEX idx_members_doc_expiry ON members (shop_id, document_expiry)
    WHERE document_expiry IS NOT NULL;
