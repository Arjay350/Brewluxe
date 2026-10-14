-- ============================================================================
-- Brewluxe Coffee Shop: Step 2 Wipe Dummy Data (Safe Transactional Cleanup)
-- ============================================================================
-- WHAT THIS SCRIPT DOES:
-- 1. Safely wipes all transactional data created during testing:
--    - public.order_items (order item lines)
--    - public.orders (customer orders)
--    - public.audit_logs (audit history logs)
--    - public.contact_messages (test inquiries)
-- 2. Wipes demo user profiles and demo auth users, while safely preserving the
--    three official staff accounts (staff@brewlux.com, admin@brewlux.com, superadmin@brewlux.com).
-- 3. Resets auto-increment sequences for orders/logs back to 1.
-- 4. CRITICAL: Leaves public.products and catalog images 100% untouched!
--
-- SAFETY INSTRUCTIONS:
-- By default, this script ends with ROLLBACK (dry run).
-- 1. Run it once to verify the output without changing any data.
-- 2. When you are ready to permanently apply the wipe, change the final line from:
--       ROLLBACK;
--    to:
--       COMMIT;
--    and click "Run".
-- ============================================================================

BEGIN;

-- Step 1: Delete order line items (child records of orders)
DELETE FROM public.order_items;

-- Step 2: Delete customer orders (child records of auth.users)
DELETE FROM public.orders;

-- Step 3: Delete audit logs
DELETE FROM public.audit_logs;

-- Step 4: Delete contact form submissions
DELETE FROM public.contact_messages;

-- Step 5: Delete dummy customer profiles (excluding official staff accounts)
DELETE FROM public.profiles
WHERE email NOT IN (
  'staff@brewlux.com',
  'admin@brewlux.com',
  'superadmin@brewlux.com'
);

-- Step 6: Delete dummy auth users (excluding official staff accounts)
DELETE FROM auth.users
WHERE email NOT IN (
  'staff@brewlux.com',
  'admin@brewlux.com',
  'superadmin@brewlux.com'
);

-- Step 7: Reset auto-increment counters back to 1 for clean transactional start
ALTER TABLE public.order_items RESTART IDENTITY;
ALTER TABLE public.audit_logs RESTART IDENTITY;
ALTER TABLE public.contact_messages RESTART IDENTITY;

-- Step 8: Preview row counts inside the transaction to verify cleanup
SELECT 'public.products (Preserved Catalog)' AS table_name, count(*) AS row_count FROM public.products WHERE available = true
UNION ALL
SELECT 'public.orders' AS table_name, count(*) AS row_count FROM public.orders
UNION ALL
SELECT 'public.order_items' AS table_name, count(*) AS row_count FROM public.order_items
UNION ALL
SELECT 'public.audit_logs' AS table_name, count(*) AS row_count FROM public.audit_logs
UNION ALL
SELECT 'public.contact_messages' AS table_name, count(*) AS row_count FROM public.contact_messages
UNION ALL
SELECT 'public.profiles (Remaining Staff)' AS table_name, count(*) AS row_count FROM public.profiles
UNION ALL
SELECT 'auth.users (Remaining Staff)' AS table_name, count(*) AS row_count FROM auth.users;

-- ============================================================================
-- CHANGE 'ROLLBACK;' TO 'COMMIT;' BELOW WHEN YOU ARE READY TO PERMANENTLY APPLY:
-- ============================================================================
ROLLBACK;
