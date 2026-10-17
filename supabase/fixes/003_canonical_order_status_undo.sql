-- Fix 003 Undo: Revert update_brewluxe_order_status function to prior version

CREATE OR REPLACE FUNCTION public.update_brewluxe_order_status(
  p_order_id uuid,
  p_status text
) RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  v_old text;
  v_email text;
BEGIN
  IF public.current_brewluxe_role() NOT IN ('EMPLOYEE', 'ADMIN', 'SUPER_ADMIN') THEN
    RAISE EXCEPTION 'Only staff can update order status.';
  END IF;
  IF p_status NOT IN ('Confirmed', 'Preparing', 'Ready', 'Out for delivery', 'Completed', 'Cancelled') THEN
    RAISE EXCEPTION 'Select a valid order status.';
  END IF;
  SELECT status INTO v_old FROM public.orders WHERE id = p_order_id FOR UPDATE;
  IF NOT FOUND THEN RAISE EXCEPTION 'Order not found.'; END IF;
  IF v_old IN ('Completed', 'Cancelled') THEN RAISE EXCEPTION 'This order is already closed.'; END IF;
  IF NOT (
    (v_old = 'Pending' AND p_status IN ('Confirmed', 'Cancelled')) OR
    (v_old = 'Confirmed' AND p_status IN ('Preparing', 'Cancelled')) OR
    (v_old = 'Preparing' AND p_status = 'Ready') OR
    (v_old = 'Ready' AND p_status IN ('Out for delivery', 'Completed')) OR
    (v_old = 'Out for delivery' AND p_status = 'Completed')
  ) THEN RAISE EXCEPTION 'That order status transition is not allowed.'; END IF;
  IF (public.current_brewluxe_role() = 'EMPLOYEE' AND p_status IN ('Cancelled', 'Out for delivery')) THEN
    RAISE EXCEPTION 'Only an admin can cancel or dispatch an order.';
  END IF;
  UPDATE public.orders SET status = p_status WHERE id = p_order_id;
  SELECT email INTO v_email FROM auth.users WHERE id = auth.uid();
  INSERT INTO public.audit_logs(actor_id, actor_email, action, entity_type, entity_id, details)
    VALUES(auth.uid(), COALESCE(v_email, ''), 'order.status_changed', 'order', p_order_id::text, jsonb_build_object('from', v_old, 'to', p_status));
END;
$$;
