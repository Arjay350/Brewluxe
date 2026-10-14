-- ============================================================================
-- Brewluxe Coffee Shop: Step 3 Assign Staff Roles
-- ============================================================================
-- WHAT THIS SCRIPT DOES:
-- 1. Verifies that the three official staff accounts exist in auth.users:
--    - superadmin@brewlux.com
--    - admin@brewlux.com
--    - staff@brewlux.com
-- 2. Ensures their public.profiles rows exist with clean display names.
-- 3. Elevates their account roles:
--    - superadmin@brewlux.com  -->  'SUPER_ADMIN'
--    - admin@brewlux.com       -->  'ADMIN'
--    - staff@brewlux.com       -->  'EMPLOYEE'
-- 4. Idempotent: safe to run multiple times.
-- 5. Strict check: If any of the 3 accounts is missing from auth.users, it
--    stops immediately and tells you which user needs to be created in Dashboard.
--
-- PREREQUISITE:
-- Before running this script, you must have created the 3 accounts in
-- Supabase Dashboard -> Authentication -> Users with "Auto Confirm User" enabled.
-- ============================================================================

DO $$
DECLARE
  v_superadmin_id uuid;
  v_admin_id uuid;
  v_staff_id uuid;
BEGIN
  -- 1. Verify superadmin@brewlux.com exists in auth.users
  SELECT id INTO v_superadmin_id FROM auth.users WHERE lower(email) = 'superadmin@brewlux.com';
  IF v_superadmin_id IS NULL THEN
    RAISE EXCEPTION 'Missing account: superadmin@brewlux.com does not exist in auth.users. Please create it in Supabase Dashboard (Authentication > Users) with "Auto Confirm User" checked, then re-run this script.';
  END IF;

  -- 2. Verify admin@brewlux.com exists in auth.users
  SELECT id INTO v_admin_id FROM auth.users WHERE lower(email) = 'admin@brewlux.com';
  IF v_admin_id IS NULL THEN
    RAISE EXCEPTION 'Missing account: admin@brewlux.com does not exist in auth.users. Please create it in Supabase Dashboard (Authentication > Users) with "Auto Confirm User" checked, then re-run this script.';
  END IF;

  -- 3. Verify staff@brewlux.com exists in auth.users
  SELECT id INTO v_staff_id FROM auth.users WHERE lower(email) = 'staff@brewlux.com';
  IF v_staff_id IS NULL THEN
    RAISE EXCEPTION 'Missing account: staff@brewlux.com does not exist in auth.users. Please create it in Supabase Dashboard (Authentication > Users) with "Auto Confirm User" checked, then re-run this script.';
  END IF;

  -- 4. Ensure profiles exist and set designated roles
  -- A. Super Admin
  INSERT INTO public.profiles (id, email, display_name, role)
  VALUES (v_superadmin_id, 'superadmin@brewlux.com', 'Super Administrator', 'SUPER_ADMIN')
  ON CONFLICT (id) DO UPDATE SET
    role = 'SUPER_ADMIN',
    display_name = 'Super Administrator',
    updated_at = now();

  -- B. Store Admin
  INSERT INTO public.profiles (id, email, display_name, role)
  VALUES (v_admin_id, 'admin@brewlux.com', 'Store Manager', 'ADMIN')
  ON CONFLICT (id) DO UPDATE SET
    role = 'ADMIN',
    display_name = 'Store Manager',
    updated_at = now();

  -- C. Barista / Staff
  INSERT INTO public.profiles (id, email, display_name, role)
  VALUES (v_staff_id, 'staff@brewlux.com', 'Brewluxe Barista', 'EMPLOYEE')
  ON CONFLICT (id) DO UPDATE SET
    role = 'EMPLOYEE',
    display_name = 'Brewluxe Barista',
    updated_at = now();

  RAISE NOTICE 'Success: All 3 staff accounts verified and roles elevated successfully!';
END $$;

-- Query to verify the resulting roles immediately
SELECT 
  p.id,
  p.email,
  p.display_name,
  p.role,
  p.updated_at
FROM public.profiles p
WHERE p.email IN ('superadmin@brewlux.com', 'admin@brewlux.com', 'staff@brewlux.com')
ORDER BY 
  CASE p.role
    WHEN 'SUPER_ADMIN' THEN 1
    WHEN 'ADMIN' THEN 2
    WHEN 'EMPLOYEE' THEN 3
    ELSE 4
  END;
