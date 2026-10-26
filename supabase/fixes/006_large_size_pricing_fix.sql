-- Fix 006: Add the ₱20 Large-size surcharge consistently to order totals and saved order line items.
-- Run this in the Supabase SQL editor after matching your current create_brewluxe_order function.

CREATE OR REPLACE FUNCTION public.create_brewluxe_order(
  p_customer_name text,
  p_phone text,
  p_address text,
  p_payment_method text,
  p_payment_reference text,
  p_items jsonb
) RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  v_order_id uuid;
  v_subtotal numeric(10,2) := 0;
  v_delivery_fee numeric(10,2) := 50;
  v_item jsonb;
  v_product public.products%rowtype;
  v_quantity integer;
  v_addons text[];
  v_unit_price numeric(10,2);
BEGIN
  IF auth.uid() IS NULL THEN
    RAISE EXCEPTION 'Please sign in before checking out.';
  END IF;

  IF length(trim(p_customer_name)) < 2 OR length(trim(p_phone)) < 7 OR length(trim(p_address)) < 8 THEN
    RAISE EXCEPTION 'Please provide valid delivery details.';
  END IF;

  IF p_payment_method NOT IN ('GCash', 'QR Payment', 'Cash on Delivery') THEN
    RAISE EXCEPTION 'Select a supported payment method.';
  END IF;

  IF p_payment_method IN ('GCash', 'QR Payment') AND coalesce(trim(p_payment_reference), '') = '' THEN
    RAISE EXCEPTION 'Enter a payment reference for this demo payment.';
  END IF;

  IF jsonb_typeof(p_items) <> 'array' OR jsonb_array_length(p_items) = 0 THEN
    RAISE EXCEPTION 'Your cart is empty.';
  END IF;

  FOR v_item IN SELECT value FROM jsonb_array_elements(p_items)
  LOOP
    v_quantity := (v_item ->> 'quantity')::integer;
    IF v_quantity < 1 OR v_quantity > 50 THEN
      RAISE EXCEPTION 'Invalid item quantity.';
    END IF;
    IF lower(coalesce(v_item ->> 'size', 'Regular')) NOT IN ('regular', 'large') THEN
      RAISE EXCEPTION 'Select a valid product size.';
    END IF;

    SELECT coalesce(array_agg(value), '{}') INTO v_addons
    FROM jsonb_array_elements_text(coalesce(v_item -> 'addons', '[]'::jsonb));

    IF EXISTS (SELECT 1 FROM unnest(v_addons) addon WHERE addon NOT IN ('Espresso Shot', 'Extra Whip', 'Pearls', 'Caramel Drizzle')) THEN
      RAISE EXCEPTION 'Invalid product add-on.';
    END IF;

    SELECT * INTO v_product
    FROM public.products
    WHERE id = (v_item ->> 'product_id')::bigint AND available = true
    FOR SHARE;

    IF NOT FOUND THEN
      RAISE EXCEPTION 'A product in your cart is no longer available.';
    END IF;
    IF v_product.category = 'Pastries' AND lower(coalesce(v_item ->> 'size', 'Regular')) = 'large' THEN
      RAISE EXCEPTION 'Pastries do not support size selection.';
    END IF;

    v_unit_price := v_product.price + coalesce((
      SELECT sum(case addon
        when 'Espresso Shot' then 20
        when 'Extra Whip' then 15
        else 15
      end)
      FROM unnest(v_addons) addon
    ), 0);

    IF lower(coalesce(v_item ->> 'size', 'Regular')) = 'large' THEN
      v_unit_price := v_unit_price + 20;
    END IF;

    v_subtotal := v_subtotal + (v_unit_price * v_quantity);
  END LOOP;

  INSERT INTO public.orders (user_id, customer_name, phone, address, payment_method,
    payment_reference, subtotal, delivery_fee, total)
  VALUES (
    auth.uid(),
    trim(p_customer_name),
    trim(p_phone),
    trim(p_address),
    p_payment_method,
    nullif(trim(p_payment_reference), ''),
    v_subtotal,
    v_delivery_fee,
    v_subtotal + v_delivery_fee
  )
  RETURNING id INTO v_order_id;

  FOR v_item IN SELECT value FROM jsonb_array_elements(p_items)
  LOOP
    v_quantity := (v_item ->> 'quantity')::integer;
    IF lower(coalesce(v_item ->> 'size', 'Regular')) NOT IN ('regular', 'large') THEN
      RAISE EXCEPTION 'Select a valid product size.';
    END IF;
    SELECT coalesce(array_agg(value), '{}') INTO v_addons
    FROM jsonb_array_elements_text(coalesce(v_item -> 'addons', '[]'::jsonb));

    SELECT * INTO v_product
    FROM public.products
    WHERE id = (v_item ->> 'product_id')::bigint;
    IF v_product.category = 'Pastries' AND lower(coalesce(v_item ->> 'size', 'Regular')) = 'large' THEN
      RAISE EXCEPTION 'Pastries do not support size selection.';
    END IF;

    v_unit_price := v_product.price + coalesce((
      SELECT sum(case addon
        when 'Espresso Shot' then 20
        when 'Extra Whip' then 15
        else 15
      end)
      FROM unnest(v_addons) addon
    ), 0);

    IF lower(coalesce(v_item ->> 'size', 'Regular')) = 'large' THEN
      v_unit_price := v_unit_price + 20;
    END IF;

    INSERT INTO public.order_items (order_id, product_id, product_name, quantity, unit_price, size, addons)
    VALUES (
      v_order_id,
      v_product.id,
      v_product.name,
      v_quantity,
      v_unit_price,
      coalesce(v_item ->> 'size', 'Regular'),
      v_addons
    );
  END LOOP;

  RETURN v_order_id;
END;
$$;

REVOKE ALL ON FUNCTION public.create_brewluxe_order(text, text, text, text, text, jsonb) FROM public;
GRANT EXECUTE ON FUNCTION public.create_brewluxe_order(text, text, text, text, text, jsonb) TO authenticated;
