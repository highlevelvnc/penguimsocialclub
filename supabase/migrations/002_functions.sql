-- ============================================================
-- PENGUIN MVP — DATABASE FUNCTIONS
-- ============================================================

-- Dispensing: get member's cannabis grams dispensed today
CREATE OR REPLACE FUNCTION get_member_dispensed_today(
    p_member_id UUID,
    p_shop_id UUID
) RETURNS DECIMAL
LANGUAGE sql STABLE
AS $$
    SELECT COALESCE(SUM(cannabis_grams_total), 0)
    FROM transactions
    WHERE member_id = p_member_id
      AND shop_id = p_shop_id
      AND created_at >= (
          CURRENT_DATE AT TIME ZONE (
              SELECT timezone FROM shops WHERE id = p_shop_id
          )
      );
$$;


-- Dispensing: get member's cannabis grams dispensed this month
CREATE OR REPLACE FUNCTION get_member_dispensed_month(
    p_member_id UUID,
    p_shop_id UUID
) RETURNS DECIMAL
LANGUAGE sql STABLE
AS $$
    SELECT COALESCE(SUM(cannabis_grams_total), 0)
    FROM transactions
    WHERE member_id = p_member_id
      AND shop_id = p_shop_id
      AND created_at >= (
          date_trunc('month', CURRENT_DATE) AT TIME ZONE (
              SELECT timezone FROM shops WHERE id = p_shop_id
          )
      );
$$;


-- Atomic checkout: insert transaction + items + deduct stock in one operation
CREATE OR REPLACE FUNCTION execute_checkout(
    p_shop_id            UUID,
    p_member_id          UUID,
    p_staff_user_id      UUID,
    p_payment_method     payment_method,
    p_total_amount       DECIMAL,
    p_cannabis_grams_total DECIMAL,
    p_item_count         INTEGER,
    p_items              JSONB
) RETURNS UUID
LANGUAGE plpgsql
AS $$
DECLARE
    v_transaction_id UUID;
    v_item JSONB;
    v_rows_updated INTEGER;
BEGIN
    -- Insert transaction record
    INSERT INTO transactions (
        shop_id, member_id, staff_user_id, payment_method,
        total_amount, cannabis_grams_total, item_count
    ) VALUES (
        p_shop_id, p_member_id, p_staff_user_id, p_payment_method,
        p_total_amount, p_cannabis_grams_total, p_item_count
    ) RETURNING id INTO v_transaction_id;

    -- Process each item: insert line item + deduct stock
    FOR v_item IN SELECT * FROM jsonb_array_elements(p_items)
    LOOP
        -- Insert transaction item
        INSERT INTO transaction_items (
            transaction_id, product_id, product_name,
            product_category, unit_type, quantity,
            unit_price, line_total, cannabis_grams
        ) VALUES (
            v_transaction_id,
            (v_item->>'productId')::UUID,
            v_item->>'productName',
            (v_item->>'productCategory')::product_category,
            (v_item->>'unitType')::unit_type,
            (v_item->>'quantity')::DECIMAL,
            (v_item->>'unitPrice')::DECIMAL,
            (v_item->>'lineTotal')::DECIMAL,
            (v_item->>'cannabisGrams')::DECIMAL
        );

        -- Deduct stock atomically (fails if insufficient)
        UPDATE products
        SET stock_quantity = stock_quantity - (v_item->>'quantity')::DECIMAL,
            updated_at = now()
        WHERE id = (v_item->>'productId')::UUID
          AND stock_quantity >= (v_item->>'quantity')::DECIMAL;

        GET DIAGNOSTICS v_rows_updated = ROW_COUNT;
        IF v_rows_updated = 0 THEN
            RAISE EXCEPTION 'Insufficient stock for product %',
                v_item->>'productName';
        END IF;
    END LOOP;

    RETURN v_transaction_id;
END;
$$;


-- Daily close: compute summary for a given date
CREATE OR REPLACE FUNCTION compute_daily_summary(
    p_shop_id UUID,
    p_date DATE
) RETURNS TABLE (
    total_transactions  INTEGER,
    total_revenue       DECIMAL,
    cash_total          DECIMAL,
    card_total          DECIMAL,
    cannabis_grams_dispensed DECIMAL,
    unique_members_served INTEGER
)
LANGUAGE sql STABLE
AS $$
    SELECT
        COUNT(*)::INTEGER AS total_transactions,
        COALESCE(SUM(total_amount), 0) AS total_revenue,
        COALESCE(SUM(CASE WHEN payment_method = 'cash' THEN total_amount ELSE 0 END), 0) AS cash_total,
        COALESCE(SUM(CASE WHEN payment_method = 'card' THEN total_amount ELSE 0 END), 0) AS card_total,
        COALESCE(SUM(cannabis_grams_total), 0) AS cannabis_grams_dispensed,
        COUNT(DISTINCT member_id)::INTEGER AS unique_members_served
    FROM transactions
    WHERE shop_id = p_shop_id
      AND created_at >= (p_date AT TIME ZONE (SELECT timezone FROM shops WHERE id = p_shop_id))
      AND created_at < ((p_date + 1) AT TIME ZONE (SELECT timezone FROM shops WHERE id = p_shop_id));
$$;
