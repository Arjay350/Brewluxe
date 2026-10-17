-- Fix 002 Undo: Revert custom RLS locks on orders & order_items

-- Revert function grant
GRANT EXECUTE ON FUNCTION public.create_brewluxe_order(text, text, text, text, text, jsonb) TO public;

-- Drop newly defined policies if reverting
DROP POLICY IF EXISTS "Customers can view their own orders" ON public.orders;
DROP POLICY IF EXISTS "Staff can view all orders" ON public.orders;
DROP POLICY IF EXISTS "Customers can view items from their own orders" ON public.order_items;
DROP POLICY IF EXISTS "Staff can view all order items" ON public.order_items;
