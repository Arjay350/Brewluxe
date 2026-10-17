-- Fix 002: Lockdown RLS policies for orders & order_items
-- Prevents anonymous reads/inserts and ensures orders are tied to authenticated users.

-- 1. Ensure RLS is enabled
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.order_items ENABLE ROW LEVEL SECURITY;

-- 2. Revoke permissions from anon
REVOKE ALL ON public.orders FROM anon;
REVOKE ALL ON public.order_items FROM anon;
REVOKE ALL ON FUNCTION public.create_brewluxe_order(text, text, text, text, text, jsonb) FROM anon;
REVOKE ALL ON FUNCTION public.create_brewluxe_order(text, text, text, text, text, jsonb) FROM public;

-- 3. Grant execute to authenticated users only
GRANT EXECUTE ON FUNCTION public.create_brewluxe_order(text, text, text, text, text, jsonb) TO authenticated;

-- 4. Customer & Staff Select Policies
DROP POLICY IF EXISTS "Customers can view their own orders" ON public.orders;
CREATE POLICY "Customers can view their own orders" ON public.orders
  FOR SELECT TO authenticated
  USING ((SELECT auth.uid()) = user_id);

DROP POLICY IF EXISTS "Staff can view all orders" ON public.orders;
CREATE POLICY "Staff can view all orders" ON public.orders
  FOR SELECT TO authenticated
  USING (public.current_brewluxe_role() IN ('EMPLOYEE', 'ADMIN', 'SUPER_ADMIN'));

DROP POLICY IF EXISTS "Customers can view items from their own orders" ON public.order_items;
CREATE POLICY "Customers can view items from their own orders" ON public.order_items
  FOR SELECT TO authenticated
  USING (EXISTS (
    SELECT 1 FROM public.orders o
    WHERE o.id = order_items.order_id
      AND o.user_id = (SELECT auth.uid())
  ));

DROP POLICY IF EXISTS "Staff can view all order items" ON public.order_items;
CREATE POLICY "Staff can view all order items" ON public.order_items
  FOR SELECT TO authenticated
  USING (public.current_brewluxe_role() IN ('EMPLOYEE', 'ADMIN', 'SUPER_ADMIN'));

-- 5. Audit query for unlinked orders (read-only verification):
-- SELECT id, customer_name, phone, created_at FROM public.orders WHERE user_id IS NULL;
