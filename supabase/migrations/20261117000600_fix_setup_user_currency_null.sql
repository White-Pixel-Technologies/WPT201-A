CREATE OR REPLACE FUNCTION private.setup_user(p_user_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
    -- Prevent simultaneous setup for the same user.
    PERFORM pg_catalog.pg_advisory_xact_lock(
        pg_catalog.hashtextextended(p_user_id::text, 1)
    );

    -- Step 1: user_settings row if missing (name and currency_code left NULL)
    INSERT INTO public.user_settings (user_id)
    VALUES (p_user_id)
    ON CONFLICT (user_id) DO NOTHING;

    -- Step 2: Insert only missing default tags.
    -- Existing custom tags and existing defaults are preserved.
    INSERT INTO public.tags
        (user_id, type, name, colour, is_default, is_others)
    SELECT
        p_user_id,
        defaults.type,
        defaults.name,
        defaults.colour,
        TRUE,
        defaults.is_others
    FROM (
        VALUES
            ('expense', 'Food', 'orange', FALSE),
            ('expense', 'Groceries', 'green', FALSE),
            ('expense', 'Rent', 'brown', FALSE),
            ('expense', 'EMI', 'purple', FALSE),
            ('expense', 'Recharge', 'cyan', FALSE),
            ('expense', 'Fuel & Transport', 'blue', FALSE),
            ('expense', 'Bills', 'indigo', FALSE),
            ('expense', 'Shopping', 'pink', FALSE),
            ('expense', 'Health', 'red', FALSE),
            ('expense', 'Education', 'teal', FALSE),
            ('expense', 'Festivals & Gifts', 'gold', FALSE),
            ('expense', 'Others', 'grey', TRUE),
            ('income', 'Salary', 'green', FALSE),
            ('income', 'Business', 'teal', FALSE),
            ('income', 'Gift', 'gold', FALSE),
            ('income', 'Refund', 'blue', FALSE),
            ('income', 'Others', 'grey', TRUE)
    ) AS defaults(type, name, colour, is_others)
    WHERE NOT EXISTS (
        SELECT 1
        FROM public.tags existing
        WHERE existing.user_id = p_user_id
          AND existing.type = defaults.type
          AND pg_catalog.lower(pg_catalog.btrim(existing.name))
              = pg_catalog.lower(pg_catalog.btrim(defaults.name))
    )
    AND (
        defaults.is_others = FALSE
        OR NOT EXISTS (
            SELECT 1
            FROM public.tags existing
            WHERE existing.user_id = p_user_id
              AND existing.type = defaults.type
              AND existing.is_others = TRUE
        )
    )
    ON CONFLICT DO NOTHING;

END;
$$;
