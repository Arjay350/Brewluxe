-- ============================================================================
-- Brewluxe Coffee Shop: Step 4 Post-Cleanup Verification (Read-Only)
-- ============================================================================
-- WHAT THIS SCRIPT DOES:
-- Confirms the complete health and clean state of your database:
-- 1. Verifies transactional tables are empty (0 rows).
-- 2. Verifies the product catalog is intact (51 active products).
-- 3. Verifies the three official staff accounts are active with their correct roles.
--
-- HOW TO RUN IN SUPABASE:
-- Paste this script into your SQL Editor and click "Run".
-- ============================================================================

-- 1. Table Row Counts Check
-- EXPECTED: orders (0), order_items (0), audit_logs (0), contact_messages (0), products (51)
SELECT '1. Active Product Catalog (Must be 51)' AS check_name, count(*) AS count_result 
FROM public.products WHERE available = true
UNION ALL
SELECT '2. Customer Orders (Must be 0)', count(*) FROM public.orders
UNION ALL
SELECT '3. Order Line Items (Must be 0)', count(*) FROM public.order_items
UNION ALL
SELECT '4. Audit Logs (Must be 0)', count(*) FROM public.audit_logs
UNION ALL
SELECT '5. Contact Inquiries (Must be 0)', count(*) FROM public.contact_messages;

-- 2. Staff Accounts & Roles Verification
-- EXPECTED: Exactly 3 rows with SUPER_ADMIN, ADMIN, and EMPLOYEE roles
SELECT 
  u.id,
  u.email,
  p.display_name,
  p.role,
  u.email_confirmed_at IS NOT NULL AS is_email_confirmed,
  u.created_at
FROM auth.users u
JOIN public.profiles p ON p.id = u.id
WHERE u.email IN (
  'superadmin@brewlux.com',
  'admin@brewlux.com',
  'staff@brewlux.com'
)
ORDER BY 
  CASE p.role
    WHEN 'SUPER_ADMIN' THEN 1
    WHEN 'ADMIN' THEN 2
    WHEN 'EMPLOYEE' THEN 3
    ELSE 4
  END;

-- 3. Any Remaining Accounts Check
-- EXPECTED: 0 rows (no unexpected dummy accounts remain)
SELECT 
  u.id,
  u.email,
  p.role,
  u.created_at
FROM auth.users u
LEFT JOIN public.profiles p ON p.id = u.id
WHERE u.email NOT IN (
  'superadmin@brewlux.com',
  'admin@brewlux.com',
  'staff@brewlux.com'
);
