-- ============================================================
-- CHECKOUT V2: Atomic limit validation + loyalty points inside transaction
-- Prevents race condition where 2 concurrent checkouts both pass JS limit check
-- ============================================================

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
    v_member RECORD;
    v_dispensed_today DECIMAL;
    v_dispensed_month DECIMAL;
    v_points_per_euro DECIMAL;
    v_points_earned INTEGER;
    v_new_balance INTEGER;
BEGIN
    -- 1. Lock the member row to prevent concurrent checkouts
    SELECT status, membership_end, daily_limit_grams, monthly_limit_grams, loyalty_points
    INTO v_member
    FROM members
    WHERE id = p_member_id AND shop_id = p_shop_id
    FOR UPDATE;

    IF NOT FOUND THEN
        RAISE EXCEPTION 'Member not found';
    END IF;

    IF v_member.status != 'active' THEN
        RAISE EXCEPTION 'Member not active';
    END IF;

    IF v_member.membership_end < CURRENT_DATE THEN
        RAISE EXCEPTION 'Membership expired';
    END IF;

    -- 2. Check dispensing limits (inside the lock — no race condition)
    v_dispensed_today := get_member_dispensed_today(p_member_id, p_shop_id);
    v_dispensed_month := get_member_dispensed_month(p_member_id, p_shop_id);

    IF p_cannabis_grams_total > (v_member.daily_limit_grams - v_dispensed_today) THEN
        RAISE EXCEPTION 'Daily limit exceeded. Remaining: %',
            GREATEST(0, v_member.daily_limit_grams - v_dispensed_today);
    END IF;

    IF p_cannabis_grams_total > (v_member.monthly_limit_grams - v_dispensed_month) THEN
        RAISE EXCEPTION 'Monthly limit exceeded. Remaining: %',
            GREATEST(0, v_member.monthly_limit_grams - v_dispensed_month);
    END IF;

    -- 3. Insert transaction record
    INSERT INTO transactions (
        shop_id, member_id, staff_user_id, payment_method,
        total_amount, cannabis_grams_total, item_count
    ) VALUES (
        p_shop_id, p_member_id, p_staff_user_id, p_payment_method,
        p_total_amount, p_cannabis_grams_total, p_item_count
    ) RETURNING id INTO v_transaction_id;

    -- 4. Process each item: insert line item + deduct stock
    FOR v_item IN SELECT * FROM jsonb_array_elements(p_items)
    LOOP
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

    -- 5. Earn loyalty points atomically (inside same transaction)
    SELECT loyalty_points_per_euro INTO v_points_per_euro
    FROM shops WHERE id = p_shop_id;

    v_points_earned := FLOOR(p_total_amount * COALESCE(v_points_per_euro, 1));

    IF v_points_earned > 0 THEN
        v_new_balance := v_member.loyalty_points + v_points_earned;

        -- Update member points
        UPDATE members
        SET loyalty_points = v_new_balance
        WHERE id = p_member_id;

        -- Create ledger entry
        INSERT INTO loyalty_ledger (
            shop_id, member_id, transaction_id, type,
            points, balance_after, description, created_by
        ) VALUES (
            p_shop_id, p_member_id, v_transaction_id, 'earn',
            v_points_earned, v_new_balance,
            '+' || v_points_earned || ' pts (€' || p_total_amount || ')',
            p_staff_user_id
        );
    END IF;

    RETURN v_transaction_id;
END;
$$;
