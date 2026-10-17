-- Fix 003: Canonical Order Status Flow
-- Enforces allowed transitions across backend function & check constraint.
-- Canonical flow:
--   Pending -> Confirmed, Cancelled
--   Confirmed -> Preparing, Cancelled
--   Preparing -> Ready, Cancelled
--   Ready -> Out for delivery, Completed
--   Out for delivery -> Completed
--   Completed / Cancelled are terminal (no transitions permitted)

-- 1. Ensure check constraint on orders.status
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.table_constraints
    WHERE table_name = 'orders' AND constraint_name = 'orders_status_check'
  ) THEN
    ALTER TABLE public.orders DROP CONSTRAINT orders_status_check;
  END IF;
END $$;

ALTER TABLE public.orders ADD CONSTRAINT orders_status_check
  CHECK (status IN ('Pending', 'Confirmed', 'Preparing', 'Ready', 'Out for delivery', 'Completed', 'Cancelled'));

-- 2. Update status transition function
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
  -- Restrict execution to staff roles
  IF public.current_brewluxe_role() NOT IN ('EMPLOYEE', 'ADMIN', 'SUPER_ADMIN') THEN
    RAISE EXCEPTION 'Only staff can update order status.';
  END IF;

  -- Validate target status value
  IF p_status NOT IN ('Pending', 'Confirmed', 'Preparing', 'Ready', 'Out for delivery', 'Completed', 'Cancelled') THEN
    RAISE EXCEPTION 'Select a valid order status.';
  END IF;

  -- Lock row for update
  SELECT status INTO v_old
  FROM public.orders
  WHERE id = p_order_id
  FOR UPDATE;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Order not found.';
  END IF;

  IF v_old IN ('Completed', 'Cancelled') THEN
    RAISE EXCEPTION 'This order is already closed.';
  END IF;

  -- Canonical transition validation
  IF NOT (
    (v_old = 'Pending' AND p_status IN ('Confirmed', 'Cancelled')) OR
    (v_old = 'Confirmed' AND p_status IN ('Preparing', 'Cancelled')) OR
    (v_old = 'Preparing' AND p_status IN ('Ready', 'Cancelled')) OR
    (v_old = 'Ready' AND p_status IN ('Out for delivery', 'Completed')) OR
    (v_old = 'Out for delivery' AND p_status = 'Completed')
  ) THEN
    RAISE EXCEPTION 'That order status transition is not allowed.';
  END IF;

  -- Perform the status update
  UPDATE public.orders
  SET status = p_status
  WHERE id = p_order_id;

  -- Log to audit table
  SELECT email INTO v_email FROM auth.users WHERE id = auth.uid();
  INSERT INTO public.audit_logs(actor_id, actor_email, action, entity_type, entity_id, details)
  VALUES (
    auth.uid(),
    COALESCE(v_email, ''),
    'order.status_changed',
    'order',
    p_order_id::text,
    jsonb_build_object('from', v_old, 'to', p_status)
  );
END;
$$;

REVOKE ALL ON FUNCTION public.update_brewluxe_order_status(uuid, text) FROM public;
GRANT EXECUTE ON FUNCTION public.update_brewluxe_order_status(uuid, text) TO authenticated;

-- Inspection query to report any orders with unknown or legacy status:
-- SELECT id, customer_name, status, created_at FROM public.orders
-- WHERE status NOT IN ('Pending', 'Confirmed', 'Preparing', 'Ready', 'Out for delivery', 'Completed', 'Cancelled');
