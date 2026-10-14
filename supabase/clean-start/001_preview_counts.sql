-- ============================================================================
-- Brewluxe Coffee Shop: Step 1 Pre-Wipe Audit (Read-Only)
-- ============================================================================
-- WHAT THIS SCRIPT DOES:
-- Inspects the current state of your database before any changes are made.
-- 1. Lists all users in auth.users and their public.profiles roles.
-- 2. Reports the exact row counts for all database tables.
--
-- HOW TO RUN IN SUPABASE:
-- 1. Open your Supabase SQL Editor (https://supabase.com/dashboard/project/bpvcqjrqnsfrqvhtdpfr/sql/new).
-- 2. Paste this entire file and click "Run".
-- 3. Review the output to confirm which accounts and records are currently present.
-- ============================================================================

-- 1. List existing users with their assigned roles and registration date
SELECT 
  u.id,
  u.email,
  COALESCE(p.display_name, '(No profile)') AS display_name,
  COALESCE(p.role, '(No role)') AS role,
  u.created_at,
  u.last_sign_in_at
FROM auth.users u
LEFT JOIN public.profiles p ON p.id = u.id
ORDER BY u.created_at DESC;

-- 2. Report row counts across all application tables
SELECT 'public.products (Active Catalog)' AS table_name, count(*) AS row_count FROM public.products WHERE available = true
UNION ALL
SELECT 'public.products (Archived / Inactive)' AS table_name, count(*) AS row_count FROM public.products WHERE available = false
UNION ALL
SELECT 'public.orders (Transactional)' AS table_name, count(*) AS row_count FROM public.orders
UNION ALL
SELECT 'public.order_items (Transactional)' AS table_name, count(*) AS row_count FROM public.order_items
UNION ALL
SELECT 'public.profiles (User Profiles)' AS table_name, count(*) AS row_count FROM public.profiles
UNION ALL
SELECT 'public.audit_logs (Audit Trail)' AS table_name, count(*) AS row_count FROM public.audit_logs
UNION ALL
SELECT 'public.contact_messages (Contact Form)' AS table_name, count(*) AS row_count FROM public.contact_messages
UNION ALL
SELECT 'auth.users (Registered Auth Users)' AS table_name, count(*) AS row_count FROM auth.users;
